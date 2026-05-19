import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { requireRoomParticipant } from "./lib/auth";
import { listRoomItems, pk, update } from "./lib/db";
import {
  activeConnectionsFromItems,
  broadcastPersonalized,
  buildRoomBroadcast,
} from "./lib/ws";
import { parseAndValidate } from "./lib/validation";
import { isRoomRecord } from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId } = event.requestContext;
  const payload = parseAndValidate(event.body);
  if (!payload || payload.action !== "setRoundTitle") {
    return { statusCode: 400, body: "Invalid setRoundTitle message" };
  }

  const { roomId, title } = payload;
  const auth = await requireRoomParticipant(connectionId, roomId);
  if (!auth.ok) return auth.response;

  // Validate title length
  if (title.trim().length === 0 || title.length > 200) {
    return {
      statusCode: 400,
      body: "Title must be between 1 and 200 characters",
    };
  }

  const items = await listRoomItems(roomId);
  const room = items.find(isRoomRecord);
  if (!room) return { statusCode: 404, body: "Room not found" };

  const round = room.currentRound ?? 1;
  const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;

  // Update current round title
  await update(
    { PK: pk(roomId), SK: roundKey },
    "SET title = :title",
    {},
    { ":title": title.trim() },
  );

  // Get updated room data and broadcast to all members
  const updatedItems = await listRoomItems(roomId);
  const connections = activeConnectionsFromItems(updatedItems);

  const roomBroadcast = buildRoomBroadcast(
    roomId,
    updatedItems,
    undefined,
    title.trim(),
  );

  await broadcastPersonalized(connections, roomBroadcast);

  return { statusCode: 200 };
}

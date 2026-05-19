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
  if (!payload || payload.action !== "reveal") {
    return { statusCode: 400, body: "Invalid reveal message" };
  }

  const { roomId } = payload;
  const auth = await requireRoomParticipant(connectionId, roomId);
  if (!auth.ok) return auth.response;

  const items = await listRoomItems(roomId);
  const room = items.find(isRoomRecord);
  if (!room) return { statusCode: 404, body: "Room not found" };

  const round = room.currentRound ?? 1;
  const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;
  await update(
    { PK: pk(roomId), SK: roundKey },
    "SET #rev = :t, revealedAt = :ts",
    { "#rev": "revealed" },
    { ":t": true, ":ts": Math.floor(Date.now() / 1000) },
  );

  // Get updated items and connections
  const updatedItems = await listRoomItems(roomId);
  const connections = activeConnectionsFromItems(updatedItems);

  const roomBroadcast = buildRoomBroadcast(
    roomId,
    updatedItems,
    undefined,
    undefined,
    true,
  );

  await broadcastPersonalized(connections, roomBroadcast);

  return { statusCode: 200 };
}

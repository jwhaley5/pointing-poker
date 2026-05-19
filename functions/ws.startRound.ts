import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { requireRoomParticipant } from "./lib/auth";
import { listRoomItems, pk, put, update, skRound } from "./lib/db";
import {
  activeConnectionsFromItems,
  broadcastPersonalized,
  buildRoomBroadcast,
} from "./lib/ws";
import { parseAndValidate } from "./lib/validation";
import type { RoundRecord } from "./lib/types";
import { isRoomRecord } from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId } = event.requestContext;
  const payload = parseAndValidate(event.body);
  if (!payload || payload.action !== "startRound") {
    return { statusCode: 400, body: "Invalid startRound message" };
  }

  const { roomId, title } = payload;
  const auth = await requireRoomParticipant(connectionId, roomId);
  if (!auth.ok) return auth.response;

  const items = await listRoomItems(roomId);
  const room = items.find(isRoomRecord);
  if (!room) return { statusCode: 404, body: "Room not found" };

  const currentRound = room.currentRound ?? 1;
  const next = (room.roundsCount ?? currentRound) + 1;
  const roundTitle = title?.trim() || `Round ${next}`;

  // Mark the current round as completed
  if (currentRound > 0) {
    await update(
      { PK: pk(roomId), SK: skRound(currentRound) },
      "SET #completed = :time",
      { "#completed": "completedAt" },
      { ":time": new Date().toISOString() },
    );
  }

  // Update room to point to new current round
  await update(
    { PK: pk(roomId), SK: "ROOM" },
    "SET #cr = :n, #rc = :n, #rev = :f",
    { "#cr": "currentRound", "#rc": "roundsCount", "#rev": "revealed" },
    { ":n": next, ":f": false },
  );

  // Create new round
  await put<RoundRecord>({
    PK: pk(roomId),
    SK: skRound(next),
    round: next,
    title: roundTitle,
    revealed: false,
    createdAt: new Date().toISOString(),
    ttl: room.ttl,
  });

  // Refresh items to get the updated data
  const updatedItems = await listRoomItems(roomId);
  const connections = activeConnectionsFromItems(updatedItems);

  const roomBroadcast = buildRoomBroadcast(
    roomId,
    updatedItems,
    undefined,
    roundTitle,
  );

  await broadcastPersonalized(connections, roomBroadcast);

  return { statusCode: 200 };
}

import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { requireRoomParticipant } from "./lib/auth";
import { listRoomItems, pk, put, skVote } from "./lib/db";
import {
  activeConnectionsFromItems,
  broadcastPersonalized,
  buildRoomBroadcast,
} from "./lib/ws";
import { parseAndValidate } from "./lib/validation";
import type { VoteRecord } from "./lib/types";
import { isRoomRecord } from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId } = event.requestContext;
  const payload = parseAndValidate(event.body);
  if (!payload || payload.action !== "vote") {
    return { statusCode: 400, body: "Invalid vote message" };
  }

  const { roomId, value } = payload;
  const auth = await requireRoomParticipant(connectionId, roomId, "member");
  if (!auth.ok) return auth.response;

  const items = await listRoomItems(roomId);
  const room = items.find(isRoomRecord);
  if (!room) return { statusCode: 404, body: "Room not found" };
  const round = room.currentRound ?? 1;

  await put<VoteRecord>({
    PK: pk(roomId),
    SK: skVote(round, auth.participant.participantId),
    round,
    memberId: auth.participant.participantId,
    value: value ?? null,
    ttl: room.ttl,
  });

  // Get updated items including the new vote
  const refreshedItems = await listRoomItems(roomId);
  const connections = activeConnectionsFromItems(refreshedItems);

  const roomBroadcast = buildRoomBroadcast(roomId, refreshedItems);

  await broadcastPersonalized(connections, roomBroadcast);

  return { statusCode: 200 };
}

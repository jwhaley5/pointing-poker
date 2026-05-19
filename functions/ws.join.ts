import { randomUUID } from "crypto";
import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { get, listRoomItems, pk, put, skConnection, update } from "./lib/db";
import {
  activeConnectionsFromItems,
  broadcastPersonalized,
  buildRoomBroadcast,
} from "./lib/ws";
import { parseAndValidate } from "./lib/validation";
import type {
  MemberRecord,
  ObserverRecord,
  RoomConnectionRecord,
  RoomRecord,
} from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId } = event.requestContext;
  const payload = parseAndValidate(event.body);

  if (!payload || payload.action !== "join") {
    return { statusCode: 400, body: "Invalid join message" };
  }

  const { roomId, name, role = "member" } = payload;
  const room = await get<RoomRecord>({ PK: pk(roomId), SK: "ROOM" });

  if (!room) {
    return { statusCode: 404, body: "Room not found" };
  }

  const now = Math.floor(Date.now() / 1000);
  const connectionTtl = now + 60 * 60 * 24;
  const roomTtl = room.ttl;
  const participantId = payload.participantId ?? randomUUID();
  const trimmedName = name.trim();
  const connectionRecord: RoomConnectionRecord = {
    PK: pk(roomId),
    SK: skConnection(connectionId),
    connectionId,
    participantId,
    role,
    ttl: connectionTtl,
  };
  await put(connectionRecord);

  if (role === "observer") {
    await put<ObserverRecord>({
      PK: pk(roomId),
      SK: `OBSERVER#${participantId}`,
      observerId: participantId,
      name: trimmedName,
      present: true,
      joinedAt: now,
      ttl: roomTtl,
    });
  } else {
    await put<MemberRecord>({
      PK: pk(roomId),
      SK: `MEMBER#${participantId}`,
      memberId: participantId,
      name: trimmedName,
      present: true,
      joinedAt: now,
      ttl: roomTtl,
    });
  }

  await update(
    { PK: `CONN#${connectionId}`, SK: "META" },
    "SET roomId = :roomId, #role = :role, participantId = :participantId, #ttl = :ttl",
    { "#role": "role", "#ttl": "ttl" },
    {
      ":roomId": roomId,
      ":role": role,
      ":participantId": participantId,
      ":ttl": connectionTtl,
    },
  );

  // Build and broadcast snapshot
  const items = await listRoomItems(roomId);
  const connections = activeConnectionsFromItems(items);
  const roomBroadcast = buildRoomBroadcast(roomId, items);

  await broadcastPersonalized(connections, roomBroadcast);

  return { statusCode: 200 };
}

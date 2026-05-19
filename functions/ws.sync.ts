import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { listRoomItems, pk, get } from "./lib/db";
import {
  activeConnectionsFromItems,
  broadcast,
  buildRoomBroadcast,
  personalizeRoomBroadcast,
} from "./lib/ws";
import { parseAndValidate } from "./lib/validation";
import type { RoomRecord } from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId } = event.requestContext;
  const payload = parseAndValidate(event.body);
  if (!payload || payload.action !== "sync") {
    return { statusCode: 400, body: "Invalid sync message" };
  }

  const { roomId } = payload;
  if (!(await get<RoomRecord>({ PK: pk(roomId), SK: "ROOM" }))) {
    return { statusCode: 404, body: "Room not found" };
  }

  const items = await listRoomItems(roomId);
  const roomBroadcastBase = buildRoomBroadcast(roomId, items);
  const currentConnection = activeConnectionsFromItems(items).find(
    (connection) => connection.connectionId === connectionId,
  );
  const roomBroadcast = personalizeRoomBroadcast(
    roomBroadcastBase,
    currentConnection,
  );

  await broadcast([connectionId], roomBroadcast);

  return { statusCode: 200 };
}

import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { del, get, pk, update, listRoomItems, skConnection } from "./lib/db";
import {
  activeConnectionsFromItems,
  broadcastPersonalized,
  buildRoomBroadcast,
} from "./lib/ws";
import type { ConnectionMetaRecord } from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId } = event.requestContext;
  const connectionRecord = await get<ConnectionMetaRecord>({
    PK: `CONN#${connectionId}`,
    SK: "META",
  });

  if (connectionRecord) {
    await del({ PK: `CONN#${connectionId}`, SK: "META" });

    const { roomId, role, participantId } = connectionRecord;

    if (!roomId || !role || !participantId) {
      return { statusCode: 200 };
    }

    await del({ PK: pk(roomId), SK: skConnection(connectionId) });

    const items = await listRoomItems(roomId);
    const connections = activeConnectionsFromItems(items);
    const hasOtherConnection = connections.some(
      (connection) =>
        connection.participantId === participantId && connection.role === role,
    );

    if (!hasOtherConnection) {
      await update(
        {
          PK: pk(roomId),
          SK:
            role === "observer"
              ? `OBSERVER#${participantId}`
              : `MEMBER#${participantId}`,
        },
        "SET present = :present",
        {},
        { ":present": false },
      );
    }

    const updatedItems = hasOtherConnection
      ? items
      : await listRoomItems(roomId);
    const updatedConnections = activeConnectionsFromItems(updatedItems);
    const roomBroadcast = buildRoomBroadcast(roomId, updatedItems);
    await broadcastPersonalized(updatedConnections, roomBroadcast);
  }

  return { statusCode: 200 };
}

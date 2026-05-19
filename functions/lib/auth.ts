import { get, pk, skConnection } from "./db";
import type {
  ConnectionMetaRecord,
  ParticipantContext,
  ParticipantRole,
  RoomConnectionRecord,
  WebSocketResponse,
} from "./types";

type AuthResult =
  | { ok: true; participant: ParticipantContext }
  | { ok: false; response: WebSocketResponse };

export async function requireRoomParticipant(
  connectionId: string,
  roomId: string,
  requiredRole?: ParticipantRole,
): Promise<AuthResult> {
  const meta = await get<ConnectionMetaRecord>({
    PK: `CONN#${connectionId}`,
    SK: "META",
  });

  if (!meta?.participantId || !meta.role || meta.roomId !== roomId) {
    return forbidden();
  }

  if (requiredRole && meta.role !== requiredRole) {
    return forbidden();
  }

  const roomConnection = await get<RoomConnectionRecord>({
    PK: pk(roomId),
    SK: skConnection(connectionId),
  });

  if (
    !roomConnection ||
    roomConnection.participantId !== meta.participantId ||
    roomConnection.role !== meta.role
  ) {
    return forbidden();
  }

  return {
    ok: true,
    participant: {
      connectionId,
      roomId,
      participantId: meta.participantId,
      role: meta.role,
    },
  };
}

function forbidden(): AuthResult {
  return { ok: false, response: { statusCode: 403, body: "forbidden" } };
}

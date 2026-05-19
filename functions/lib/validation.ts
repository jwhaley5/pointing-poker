// Simple type validation helpers for WebSocket messages
import type { ClientMessage } from "@pointing-poker/shared-types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

const hasRoomId = (payload: Record<string, unknown>) =>
  isString(payload.roomId) && payload.roomId.trim().length > 0;

export function validateClientMessage(
  payload: unknown,
): payload is ClientMessage {
  if (!isRecord(payload)) return false;

  const { action } = payload;

  switch (action) {
    case "sync":
      return hasRoomId(payload);

    case "join":
      return (
        hasRoomId(payload) &&
        isString(payload.name) &&
        payload.name.trim().length > 0 &&
        payload.name.length <= 80 &&
        (payload.role === undefined ||
          payload.role === "member" ||
          payload.role === "observer") &&
        (payload.participantId === undefined ||
          isValidParticipantId(payload.participantId))
      );

    case "vote":
      return (
        hasRoomId(payload) &&
        (payload.value === null ||
          (isString(payload.value) && payload.value.length <= 20))
      );

    case "reveal":
      return hasRoomId(payload);

    case "startRound":
      return (
        hasRoomId(payload) &&
        (payload.title === undefined ||
          (isString(payload.title) && payload.title.length <= 200))
      );

    case "setRoomTitle":
      return hasRoomId(payload) && isString(payload.title);

    case "setRoundTitle":
      return hasRoomId(payload) && isString(payload.title);

    default:
      return false;
  }
}

export function parseAndValidate(
  body: string | null | undefined,
): ClientMessage | null {
  try {
    const payload: unknown = JSON.parse(body || "{}");
    return validateClientMessage(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function isValidParticipantId(value: unknown): value is string {
  return isString(value) && /^[A-Za-z0-9_-]{8,80}$/.test(value);
}

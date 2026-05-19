export interface RoomSession {
  participantId: string
  role: "member" | "observer"
  name: string
}

const participantIdPattern = /^[A-Za-z0-9_-]{8,80}$/

const sessionKey = (roomId: string) => `pp:room:${roomId}:session`

export function readRoomSession(roomId: string): RoomSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(roomId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<RoomSession>
    if (
      !parsed.participantId ||
      !participantIdPattern.test(parsed.participantId) ||
      (parsed.role !== "member" && parsed.role !== "observer") ||
      !parsed.name
    ) {
      return null
    }

    return {
      participantId: parsed.participantId,
      role: parsed.role,
      name: parsed.name,
    }
  } catch {
    return null
  }
}

export function writeRoomSession(roomId: string, session: RoomSession) {
  localStorage.setItem(sessionKey(roomId), JSON.stringify(session))
}

import { beforeEach, describe, expect, it, vi } from "vitest"
import { readRoomSession, writeRoomSession } from "./session"

describe("room session storage", () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    })
  })

  it("persists a stable participant identity for a room", () => {
    writeRoomSession("room-1", {
      participantId: "participant_123",
      role: "member",
      name: "Ada",
    })

    expect(readRoomSession("room-1")).toEqual({
      participantId: "participant_123",
      role: "member",
      name: "Ada",
    })
  })

  it("ignores invalid stored sessions", () => {
    localStorage.setItem(
      "pp:room:room-1:session",
      JSON.stringify({ participantId: "bad/key", role: "member", name: "Ada" }),
    )

    expect(readRoomSession("room-1")).toBeNull()
  })
})

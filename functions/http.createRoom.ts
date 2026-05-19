import { randomUUID } from "crypto";
import { put, pk, skRound } from "./lib/db";
import type { RoomRecord, RoundRecord } from "./lib/types";

export async function handler() {
  const roomId = randomUUID().slice(0, 8);
  const now = Math.floor(Date.now() / 1000);
  const ttl = now + 60 * 60 * 24 * 7;

  await put<RoomRecord>({
    PK: pk(roomId),
    SK: "ROOM",
    schemaVersion: 2,
    roomId,
    title: "New Room",
    currentRound: 1,
    roundsCount: 1,
    createdAt: now,
    ttl,
  });

  await put<RoundRecord>({
    PK: pk(roomId),
    SK: skRound(1),
    round: 1,
    title: "Round 1",
    revealed: false,
    createdAt: now,
    ttl,
  });

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
    body: JSON.stringify({ roomId }),
  };
}

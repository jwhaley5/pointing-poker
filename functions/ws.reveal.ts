import { listRoomItems, pk, update } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";
import type { RevealMessage } from "@pointing-poker/shared-types";

export async function handler(event: any) {
	const payload = JSON.parse(event.body || "{}") as RevealMessage;
	const { roomId } = payload;
	
	if (!roomId) return { statusCode: 400, body: "roomId required" };

	const items = await listRoomItems(roomId);
	const room = items.find((i: any) => i.SK === "ROOM");
	if (!room) return { statusCode: 403, body: "forbidden" };

	const round = room.currentRound ?? 1;
	const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;
	await update(
		{ PK: pk(roomId), SK: roundKey },
		"SET #rev = :t, revealedAt = :ts",
		{ "#rev": "revealed" },
		{ ":t": true, ":ts": Math.floor(Date.now() / 1000) }
	);

	// Get updated items and connections
	const updatedItems = await listRoomItems(roomId);
	const connections = updatedItems.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	const roomBroadcast = buildRoomBroadcast(roomId, updatedItems, undefined, undefined, true);

	await broadcastPersonalized(connections, roomBroadcast);

	return { statusCode: 200 };
}

import { listRoomItems, pk, put, update, skRound } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";

export async function handler(event: any) {
	const { roomId, title } = JSON.parse(event.body || "{}");
	if (!roomId) return { statusCode: 400, body: "roomId required" };

	const items = await listRoomItems(roomId);
	const room = items.find((i: any) => i.SK === "ROOM");
	if (!room) return { statusCode: 403, body: "forbidden" };

	const currentRound = room.currentRound ?? 1;
	const next = (room.roundsCount ?? currentRound) + 1;

	// Mark the current round as completed
	if (currentRound > 0) {
		await update(
			{ PK: pk(roomId), SK: skRound(currentRound) },
			"SET #completed = :time",
			{ "#completed": "completedAt" },
			{ ":time": new Date().toISOString() }
		);
	}

	// Update room to point to new current round
	await update(
		{ PK: pk(roomId), SK: "ROOM" },
		"SET #cr = :n, #rc = :n, #rev = :f",
		{ "#cr": "currentRound", "#rc": "roundsCount", "#rev": "revealed" },
		{ ":n": next, ":f": false }
	);

	// Create new round
	await put({
		PK: pk(roomId),
		SK: skRound(next),
		round: next,
		title: title || `Round ${next}`,
		revealed: false,
		createdAt: new Date().toISOString(),
	});

	// Refresh items to get the updated data
	const updatedItems = await listRoomItems(roomId);
	const connections = updatedItems.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	const roomBroadcast = buildRoomBroadcast(roomId, updatedItems, undefined, title || `Round ${next}`);

	await broadcastPersonalized(connections, roomBroadcast);

	return { statusCode: 200 };
}

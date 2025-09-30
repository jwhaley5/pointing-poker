import { listRoomItems, pk, update } from "./lib/db";
import { broadcastPersonalized } from "./lib/ws";

export async function handler(event: any) {
	const { roomId, title } = JSON.parse(event.body || "{}");
	if (!roomId || !title) return { statusCode: 400, body: "roomId and title required" };

	// Validate title length
	if (title.trim().length === 0 || title.length > 100) {
		return { statusCode: 400, body: "Title must be between 1 and 100 characters" };
	}

	const items = await listRoomItems(roomId);
	const room = items.find((i: any) => i.SK === "ROOM");
	if (!room) return { statusCode: 404, body: "Room not found" };

	// Update room title
	await update(
		{ PK: pk(roomId), SK: "ROOM" },
		"SET title = :title",
		{},
		{ ":title": title.trim() }
	);

	// Get updated room data and broadcast to all members
	const round = room.currentRound ?? 1;
	const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;
	const roundItem = items.find((i: any) => i.SK === roundKey) || { title: `Round ${round}`, revealed: false };
	const revealed = !!roundItem.revealed;

	const members = items
		.filter((i: any) => i.SK.startsWith("MEMBER#"))
		.map((m: any) => ({ memberId: m.memberId, name: m.name, present: m.present }));

	const votePrefix = `VOTE#${round.toString().padStart(4, "0")}#`;
	const voteItems = items.filter((i: any) => i.SK.startsWith(votePrefix));
	const votes: Record<string, string | null> = Object.fromEntries(members.map((m: any) => [m.memberId, null]));
	for (const v of voteItems) votes[v.memberId] = revealed ? v.value ?? null : null;

	const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	await broadcastPersonalized(connections, {
		type: "room",
		roomId,
		title: title.trim(),
		currentRound: round,
		roundTitle: roundItem.title,
		revealed,
		members,
		votes,
	});

	return { statusCode: 200 };
}
import { listRoomItems, pk, update } from "./lib/db";
import { broadcastPersonalized } from "./lib/ws";

export async function handler(event: any) {
	const { roomId } = JSON.parse(event.body || "{}");
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

	const members = items
		.filter((i: any) => i.SK.startsWith("MEMBER#"))
		.map((m: any) => ({ memberId: m.memberId, name: m.name, present: m.present }));

	const votePrefix = `VOTE#${round.toString().padStart(4, "0")}#`;
	const voteItems = items.filter((i: any) => i.SK.startsWith(votePrefix));
	const votes = Object.fromEntries(members.map((m: any) => [m.memberId, null]));
	for (const v of voteItems) votes[v.memberId] = v.value ?? null;

	const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	await broadcastPersonalized(connections, {
		type: "room",
		roomId,
		title: room.title || "New Room",
		currentRound: round,
		roundTitle: (items.find((i: any) => i.SK === roundKey)?.title) || `Round ${round}`,
		revealed: true,
		members,
		votes,
	});

	return { statusCode: 200 };
}

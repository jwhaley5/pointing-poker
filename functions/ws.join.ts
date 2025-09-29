import { listRoomItems, pk, put } from "./lib/db";
import { broadcast } from "./lib/ws";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const { roomId, name } = JSON.parse(event.body || "{}");
	if (!roomId || !name) return { statusCode: 400, body: "roomId and name required" };

	const memberId = connectionId;
	const now = Math.floor(Date.now() / 1000);

	await put({ PK: pk(roomId), SK: `CONN#${connectionId}`, connectionId, memberId, ttl: now + 60 * 60 * 24 });
	await put({ PK: pk(roomId), SK: `MEMBER#${memberId}`, memberId, name, present: true, joinedAt: now });

	// Build snapshot
	const items = await listRoomItems(roomId);
	const room = items.find((i: any) => i.SK === "ROOM") || {};
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

	await broadcast(connections, {
		type: "room",
		roomId,
		currentRound: round,
		roundTitle: roundItem.title,
		revealed,
		members,
		votes,
	});

	return { statusCode: 200 };
}

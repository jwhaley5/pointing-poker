import { listRoomItems, pk, put, skVote } from "./lib/db";
import { broadcast } from "./lib/ws";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const { roomId, value } = JSON.parse(event.body || "{}");
	if (!roomId) return { statusCode: 400, body: "roomId required" };

	const items = await listRoomItems(roomId);
	const room = items.find((i: any) => i.SK === "ROOM") || {};
	const round = room.currentRound ?? 1;

	await put({
		PK: pk(roomId),
		SK: skVote(round, connectionId),
		round,
		memberId: connectionId,
		value: value ?? null,
	});

	const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;
	const roundItem = items.find((i: any) => i.SK === roundKey) || { title: `Round ${round}`, revealed: false };
	const revealed = !!roundItem.revealed;

	const members = items
		.filter((i: any) => i.SK.startsWith("MEMBER#"))
		.map((m: any) => ({ memberId: m.memberId, name: m.name, present: m.present }));

	const votePrefix = `VOTE#${round.toString().padStart(4, "0")}#`;
	const refreshed = await listRoomItems(roomId); // get the newly written vote too
	const voteItems = refreshed.filter((i: any) => i.SK.startsWith(votePrefix));

	const votes: Record<string, string | null> = Object.fromEntries(members.map((m: any) => [m.memberId, null]));
	for (const v of voteItems) votes[v.memberId] = v.value ?? null;

	const connections = refreshed.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

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

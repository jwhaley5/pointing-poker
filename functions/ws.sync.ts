import { listRoomItems } from "./lib/db";
import { broadcast } from "./lib/ws";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const { roomId } = JSON.parse(event.body || "{}");
	if (!roomId) return { statusCode: 400, body: "roomId required" };

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

	await broadcast([connectionId], {
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

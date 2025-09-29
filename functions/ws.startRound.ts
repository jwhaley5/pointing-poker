import { listRoomItems, pk, put, update, skRound } from "./lib/db";
import { broadcast } from "./lib/ws";

export async function handler(event: any) {
	const { roomId, title } = JSON.parse(event.body || "{}");
	if (!roomId) return { statusCode: 400, body: "roomId required" };

	const items = await listRoomItems(roomId);
	const room = items.find((i: any) => i.SK === "ROOM");
	if (!room) return { statusCode: 403, body: "forbidden" };

	const next = (room.roundsCount ?? room.currentRound ?? 1) + 1;

	await update(
		{ PK: pk(roomId), SK: "ROOM" },
		"SET #cr = :n, #rc = :n, #rev = :f",
		{ "#cr": "currentRound", "#rc": "roundsCount", "#rev": "revealed" },
		{ ":n": next, ":f": false }
	);

	await put({
		PK: pk(roomId),
		SK: skRound(next),
		round: next,
		title: title || `Round ${next}`,
		revealed: false,
		createdAt: Math.floor(Date.now() / 1000),
	});

	const members = items
		.filter((i: any) => i.SK.startsWith("MEMBER#"))
		.map((m: any) => ({ memberId: m.memberId, name: m.name, present: m.present }));
	const votes = Object.fromEntries(members.map((m: any) => [m.memberId, null]));

	const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	await broadcast(connections, {
		type: "room",
		roomId,
		currentRound: next,
		roundTitle: title || `Round ${next}`,
		revealed: false,
		members,
		votes,
	});

	return { statusCode: 200 };
}

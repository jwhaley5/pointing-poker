import { get, listRoomItems, pk, put, update } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";
import { parseAndValidate } from "./lib/validation";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const payload = parseAndValidate(event.body || "{}");
	
	if (!payload || payload.action !== 'join') {
		return { statusCode: 400, body: "Invalid join message" };
	}
	
	const { roomId, name, role = 'member' } = payload as any;
	const room = await get({ PK: pk(roomId), SK: "ROOM" });

	if (!room) {
		return { statusCode: 404, body: "Room not found" };
	}

	const now = Math.floor(Date.now() / 1000);
	const participantId = connectionId;

	if (role === 'observer') {
		const observerId = participantId;
		const connectionRecord = { PK: pk(roomId), SK: `CONN#${connectionId}`, connectionId, observerId, ttl: now + 60 * 60 * 24 };
		await put(connectionRecord);
		await put({ PK: pk(roomId), SK: `OBSERVER#${observerId}`, observerId, name, present: true, joinedAt: now });
	} else {
		const memberId = participantId;
		const connectionRecord = { PK: pk(roomId), SK: `CONN#${connectionId}`, connectionId, memberId, ttl: now + 60 * 60 * 24 };
		await put(connectionRecord);
		await put({ PK: pk(roomId), SK: `MEMBER#${memberId}`, memberId, name, present: true, joinedAt: now });
	}

	await update(
		{ PK: `CONN#${connectionId}`, SK: "META" },
		"SET roomId = :roomId, #role = :role, participantId = :participantId, #ttl = :ttl",
		{ "#role": "role", "#ttl": "ttl" },
		{ ":roomId": roomId, ":role": role, ":participantId": participantId, ":ttl": now + 60 * 60 * 24 }
	);

	// Build and broadcast snapshot
	const items = await listRoomItems(roomId);
	const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);
	const roomBroadcast = buildRoomBroadcast(roomId, items);

	await broadcastPersonalized(connections, roomBroadcast);

	return { statusCode: 200 };
}

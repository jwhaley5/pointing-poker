import { listRoomItems, pk, put } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";
import { parseAndValidate } from "./lib/validation";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const payload = parseAndValidate(event.body || "{}");
	
	if (!payload || payload.action !== 'join') {
		return { statusCode: 400, body: "Invalid join message" };
	}
	
	const { roomId, name } = payload;

	const memberId = connectionId;
	const now = Math.floor(Date.now() / 1000);

	const connectionRecord = { PK: pk(roomId), SK: `CONN#${connectionId}`, connectionId, memberId, ttl: now + 60 * 60 * 24 };
	await put(connectionRecord);
	await put({ PK: pk(roomId), SK: `MEMBER#${memberId}`, memberId, name, present: true, joinedAt: now });

	// Build and broadcast snapshot
	const items = await listRoomItems(roomId);
	const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);
	const roomBroadcast = buildRoomBroadcast(roomId, items);

	await broadcastPersonalized(connections, roomBroadcast);

	return { statusCode: 200 };
}

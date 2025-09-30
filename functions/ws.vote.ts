import { listRoomItems, pk, put, skVote } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";
import type { VoteMessage } from "@pointing-poker/shared-types";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const payload = JSON.parse(event.body || "{}") as VoteMessage;
	const { roomId, value } = payload;
	
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

	// Get updated items including the new vote
	const refreshedItems = await listRoomItems(roomId);
	const connections = refreshedItems.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	const roomBroadcast = buildRoomBroadcast(roomId, refreshedItems);

	await broadcastPersonalized(connections, roomBroadcast);

	return { statusCode: 200 };
}

import { listRoomItems } from "./lib/db";
import { broadcast, buildRoomBroadcast } from "./lib/ws";
import type { RoomBroadcast } from "../shared/src/index";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const { roomId } = JSON.parse(event.body || "{}");
	if (!roomId) return { statusCode: 400, body: "roomId required" };

	const items = await listRoomItems(roomId);
	const roomBroadcastBase = buildRoomBroadcast(roomId, items);

	const roomBroadcast: RoomBroadcast = {
		...roomBroadcastBase,
		currentMemberId: connectionId,
	};

	await broadcast([connectionId], roomBroadcast);

	return { statusCode: 200 };
}

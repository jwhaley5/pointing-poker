import { listRoomItems, pk, update } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";
import type { SetRoomTitleMessage } from "@pointing-poker/shared-types";

export async function handler(event: any) {
	const payload = JSON.parse(event.body || "{}") as SetRoomTitleMessage;
	const { roomId, title } = payload;
	
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
	const updatedItems = await listRoomItems(roomId);
	const connections = updatedItems.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

	const roomBroadcast = buildRoomBroadcast(roomId, updatedItems, title.trim());

	await broadcastPersonalized(connections, roomBroadcast);

	return { statusCode: 200 };
}
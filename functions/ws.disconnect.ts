import { del, get, pk, update, listRoomItems } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const connectionRecord = await get({ PK: `CONN#${connectionId}`, SK: "META" });

	if (connectionRecord) {
		await del({ PK: `CONN#${connectionId}`, SK: "META" });

		const { roomId, role, participantId } = connectionRecord as {
			roomId?: string;
			role?: "member" | "observer";
			participantId?: string;
		};

		if (!roomId || !participantId) {
			return { statusCode: 200 };
		}

		await del({ PK: pk(roomId), SK: `CONN#${connectionId}` });

		if (role === "observer") {
			await update(
				{ PK: pk(roomId), SK: `OBSERVER#${participantId}` },
				"SET present = :present",
				{},
				{ ":present": false }
			);
		} else {
			await update(
				{ PK: pk(roomId), SK: `MEMBER#${participantId}` },
				"SET present = :present",
				{},
				{ ":present": false }
			);
		}

		const items = await listRoomItems(roomId);
		const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);
		const roomBroadcast = buildRoomBroadcast(roomId, items);
		await broadcastPersonalized(connections, roomBroadcast);
	}

	return { statusCode: 200 };
}

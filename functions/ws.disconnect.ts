import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Resource } from "sst";
import { del, pk, update, listRoomItems } from "./lib/db";
import { broadcastPersonalized } from "./lib/ws";

const ddb = new DynamoDBClient({});
const TABLE = Resource["johnWhaley-poker-pokerTable"].name as string;

export async function handler(event: any) {
	const { connectionId } = event.requestContext;
	const memberId = connectionId; // Based on join handler, memberId = connectionId
	// Find which room this connection belongs to by scanning for the connection record
	// The connection record has PK="ROOM#${roomId}" and SK="CONN#${connectionId}"
	const scanResult = await ddb.send(new ScanCommand({
		TableName: TABLE,
		FilterExpression: "SK = :sk",
		ExpressionAttributeValues: marshall({
			":sk": `CONN#${connectionId}`
		}),
	}));

	const connectionRecord = scanResult.Items?.[0] ? unmarshall(scanResult.Items[0]) : null;

	if (connectionRecord) {
		const roomId = connectionRecord.PK.replace('ROOM#', '');

		// Delete the connection record
		await del({ PK: pk(roomId), SK: `CONN#${connectionId}` });

		// Mark member as not present
		await update(
			{ PK: pk(roomId), SK: `MEMBER#${memberId}` },
			"SET present = :present",
			{},
			{ ":present": false }
		);

		// Broadcast updated room state to remaining connections
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

		await broadcastPersonalized(connections, {
			type: "room",
			roomId,
			title: room.title || "New Room",
			currentRound: round,
			roundTitle: roundItem.title,
			revealed,
			members,
			votes,
		});
	} else {
		console.error('ERROR: No connection record found for connectionId:', connectionId);
	}

	return { statusCode: 200 };
}

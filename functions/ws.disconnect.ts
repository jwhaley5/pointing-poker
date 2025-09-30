import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Resource } from "sst";
import { del, pk, update, listRoomItems } from "./lib/db";
import { broadcastPersonalized, buildRoomBroadcast } from "./lib/ws";

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
		const connections = items.filter((i: any) => i.SK.startsWith("CONN#")).map((i: any) => i.connectionId);

		const roomBroadcast = buildRoomBroadcast(roomId, items);

		await broadcastPersonalized(connections, roomBroadcast);
	} else {
		console.error('ERROR: No connection record found for connectionId:', connectionId);
	}

	return { statusCode: 200 };
}


import { DynamoDBClient, QueryCommand, PutItemCommand, UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Resource } from "sst";

const ddb = new DynamoDBClient({});

// Because your construct name contains dashes, use bracket notation:
export const TABLE = Resource["johnWhaley-poker-pokerTable"].name as string;

export const pk = (roomId: string) => `ROOM#${roomId}`;
const roundStr = (n: number) => n.toString().padStart(4, "0");
export const skRound = (n: number) => `ROUND#${roundStr(n)}`;
export const skVote = (n: number, memberId: string) => `VOTE#${roundStr(n)}#${memberId}`;

export async function listRoomItems(roomId: string) {
	const out = await ddb.send(new QueryCommand({
		TableName: TABLE,
		KeyConditionExpression: "PK = :pk",
		ExpressionAttributeValues: marshall({ ":pk": pk(roomId) }),
	}));
	return (out.Items || []).map((i) => unmarshall(i));
}

export async function put(item: any) {
	await ddb.send(new PutItemCommand({
		TableName: TABLE,
		Item: marshall(item, { removeUndefinedValues: true })
	}));
}

export async function update(keys: any, expr: string, names: any, values: any) {
	const command: any = {
		TableName: TABLE,
		Key: marshall(keys),
		UpdateExpression: expr,
		ExpressionAttributeValues: marshall(values),
	};
	
	if (names && Object.keys(names).length > 0) {
		command.ExpressionAttributeNames = names;
	}
	
	await ddb.send(new UpdateItemCommand(command));
}

export async function del(keys: any) {
	await ddb.send(new DeleteItemCommand({
		TableName: TABLE,
		Key: marshall(keys),
	}));
}

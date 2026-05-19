import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import type {
  AttributeValue,
  UpdateItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import type { DbRecord, RoomItem } from "./types";

const ddb = new DynamoDBClient({});
export const TABLE = process.env.TABLE_NAME ?? "";

export const pk = (roomId: string) => `ROOM#${roomId}`;
const roundStr = (n: number) => n.toString().padStart(4, "0");
export const skRound = (n: number) => `ROUND#${roundStr(n)}`;
export const skVote = (n: number, memberId: string) =>
  `VOTE#${roundStr(n)}#${memberId}`;
export const skConnection = (connectionId: string) => `CONN#${connectionId}`;

export async function listRoomItems(roomId: string) {
  const out = await ddb.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: marshall({ ":pk": pk(roomId) }),
    }),
  );
  return (out.Items || []).map((i) => unmarshall(i) as RoomItem);
}

export async function get<T extends DbRecord>(keys: {
  PK: string;
  SK: string;
}) {
  const out = await ddb.send(
    new GetItemCommand({
      TableName: TABLE,
      Key: marshall(keys),
    }),
  );

  return out.Item ? (unmarshall(out.Item) as T) : null;
}

export async function put<T extends DbRecord>(item: T) {
  await ddb.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: marshall(item, { removeUndefinedValues: true }),
    }),
  );
}

export async function update(
  keys: { PK: string; SK: string },
  expr: string,
  names: Record<string, string>,
  values: Record<string, unknown>,
) {
  const command: UpdateItemCommandInput = {
    TableName: TABLE,
    Key: marshall(keys) as Record<string, AttributeValue>,
    UpdateExpression: expr,
    ExpressionAttributeValues: marshall(values) as Record<
      string,
      AttributeValue
    >,
  };

  if (names && Object.keys(names).length > 0) {
    command.ExpressionAttributeNames = names;
  }

  await ddb.send(new UpdateItemCommand(command));
}

export async function del(keys: { PK: string; SK: string }) {
  await ddb.send(
    new DeleteItemCommand({
      TableName: TABLE,
      Key: marshall(keys),
    }),
  );
}

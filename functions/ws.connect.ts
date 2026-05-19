import type { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { put } from "./lib/db";
import type { ConnectionMetaRecord } from "./lib/types";

export async function handler(event: APIGatewayProxyWebsocketEventV2) {
  const { connectionId, domainName, stage } = event.requestContext;
  const now = Math.floor(Date.now() / 1000);
  await put<ConnectionMetaRecord>({
    PK: `CONN#${connectionId}`,
    SK: "META",
    connectionId,
    domainName,
    stage,
    ttl: now + 60 * 60 * 24,
  });
  return { statusCode: 200 };
}

import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export function wsClient() {
	const endpoint = process.env.WS_MANAGEMENT_ENDPOINT!;
	return new ApiGatewayManagementApiClient({ endpoint });
}

export async function broadcast(connectionIds: string[], payload: any) {
	const client = wsClient();
	const Data = Buffer.from(JSON.stringify(payload));
	await Promise.allSettled(
		connectionIds.map((ConnectionId) =>
			client.send(new PostToConnectionCommand({ ConnectionId, Data }))
		)
	);
}

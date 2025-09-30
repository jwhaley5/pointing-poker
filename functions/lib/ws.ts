import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

export function wsClient() {
	const endpoint = process.env.WS_MANAGEMENT_ENDPOINT!;
	return new ApiGatewayManagementApiClient({ endpoint });
}

export async function broadcast(connectionIds: string[], payload: any) {
	const client = wsClient();
	const Data = Buffer.from(JSON.stringify(payload));
	const results = await Promise.allSettled(
		connectionIds.map((ConnectionId) =>
			client.send(new PostToConnectionCommand({ ConnectionId, Data }))
		)
	);

	// Log any failures
	results.forEach((result, index) => {
		if (result.status === 'rejected') {
			console.error(`Failed to send message to connection ${connectionIds[index]}:`, result.reason);
		}
	});
}

export async function broadcastPersonalized(connections: string[], basePayload: any) {
	const client = wsClient();
	const results = await Promise.allSettled(
		connections.map((connectionId) => {
			const personalizedPayload = {
				...basePayload,
				currentMemberId: connectionId
			};
			const Data = Buffer.from(JSON.stringify(personalizedPayload));
			return client.send(new PostToConnectionCommand({ 
				ConnectionId: connectionId, 
				Data 
			}));
		})
	);

	// Log any failures
	results.forEach((result, index) => {
		if (result.status === 'rejected') {
			console.error(`Failed to send message to connection ${connections[index]}:`, result.reason);
		}
	});
}

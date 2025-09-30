import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import type { RoomBroadcastBase, RoundHistory } from "@pointing-poker/shared-types";

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
			const isMember = basePayload.members.some((m: any) => m.memberId === connectionId);
			const isObserver = basePayload.observers.some((o: any) => o.observerId === connectionId);
			
			const personalizedPayload = {
				...basePayload,
				...(isMember && { currentMemberId: connectionId }),
				...(isObserver && { currentObserverId: connectionId })
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

// Utility function to build a complete room broadcast from database items
export function buildRoomBroadcast(
	roomId: string, 
	items: any[], 
	customTitle?: string,
	customRoundTitle?: string,
	forceRevealed?: boolean
): RoomBroadcastBase {
	const room = items.find((i: any) => i.SK === "ROOM") || {};
	const round = room.currentRound ?? 1;
	const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;
	const roundItem = items.find((i: any) => i.SK === roundKey) || { title: `Round ${round}`, revealed: false };
	const revealed = forceRevealed ?? !!roundItem.revealed;

	const members = items
		.filter((i: any) => i.SK.startsWith("MEMBER#"))
		.map((m: any) => ({ memberId: m.memberId, name: m.name, present: m.present }));

	const observers = items
		.filter((i: any) => i.SK.startsWith("OBSERVER#"))
		.map((o: any) => ({ observerId: o.observerId, name: o.name, present: o.present }));

	const votePrefix = `VOTE#${round.toString().padStart(4, "0")}#`;
	const voteItems = items.filter((i: any) => i.SK.startsWith(votePrefix));
	const currentRoundVotes: Record<string, string | null> = Object.fromEntries(members.map((m: any) => [m.memberId, null]));
	// Always include all votes - let the frontend handle visibility
	for (const v of voteItems) {
		currentRoundVotes[v.memberId] = v.value ?? null;
	}

	// Collect round history with votes
	const roundHistory: RoundHistory[] = items
		.filter((i: any) => i.SK.startsWith("ROUND#") && i.SK !== roundKey)
		.map((r: any) => {
			const roundNum = parseInt(r.SK.replace("ROUND#", ""));
			const historyVotePrefix = `VOTE#${roundNum.toString().padStart(4, "0")}#`;
			const historyVoteItems = items.filter((i: any) => i.SK.startsWith(historyVotePrefix));
			
			// Build historical votes - show all votes for completed rounds
			const historicalVotes: Record<string, string | null> = Object.fromEntries(members.map((m: any) => [m.memberId, null]));
			for (const v of historyVoteItems) {
				historicalVotes[v.memberId] = v.value ?? null;
			}
			
			return {
				roundNumber: roundNum,
				title: r.title || `Round ${roundNum}`,
				revealed: !!r.revealed,
				completedAt: r.completedAt,
				votes: historicalVotes
			};
		})
		.sort((a, b) => b.roundNumber - a.roundNumber);

	return {
		type: "room",
		roomId,
		title: customTitle ?? room.title ?? "New Room",
		currentRound: round,
		roundTitle: customRoundTitle ?? roundItem.title ?? `Round ${round}`,
		revealed,
		members,
		observers,
		currentRoundVotes,
		roundHistory,
	};
}

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import type {
  RoomBroadcast,
  RoomBroadcastBase,
  RoundHistory,
} from "@pointing-poker/shared-types";
import type { RoomConnectionRecord, RoomItem } from "./types";
import {
  isMemberRecord,
  isObserverRecord,
  isRoomConnectionRecord,
  isRoomRecord,
  isRoundRecord,
  isVoteRecord,
} from "./types";

export function wsClient() {
  const endpoint = process.env.WS_MANAGEMENT_ENDPOINT!;
  return new ApiGatewayManagementApiClient({ endpoint });
}

export async function broadcast(
  connectionIds: string[],
  payload: RoomBroadcast,
) {
  const client = wsClient();
  const Data = Buffer.from(JSON.stringify(payload));
  const results = await Promise.allSettled(
    connectionIds.map((ConnectionId) =>
      client.send(new PostToConnectionCommand({ ConnectionId, Data })),
    ),
  );

  // Log failed sends without blocking delivery to other connections.
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to send message to connection ${connectionIds[index]}:`,
        result.reason,
      );
    }
  });
}

export async function broadcastPersonalized(
  connections: RoomConnectionRecord[],
  basePayload: RoomBroadcastBase,
) {
  const client = wsClient();
  const results = await Promise.allSettled(
    connections.map((connection) => {
      const personalizedPayload = personalizeRoomBroadcast(
        basePayload,
        connection,
      );
      const Data = Buffer.from(JSON.stringify(personalizedPayload));
      return client.send(
        new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data,
        }),
      );
    }),
  );

  // Log failed sends without blocking delivery to other connections.
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to send message to connection ${connections[index]?.connectionId}:`,
        result.reason,
      );
    }
  });
}

export function activeConnectionsFromItems(items: RoomItem[]) {
  return items.filter(isRoomConnectionRecord);
}

export function personalizeRoomBroadcast(
  basePayload: RoomBroadcastBase,
  connection?: RoomConnectionRecord | null,
): RoomBroadcast {
  return {
    ...basePayload,
    ...(connection?.role === "member" && {
      currentMemberId: connection.participantId,
    }),
    ...(connection?.role === "observer" && {
      currentObserverId: connection.participantId,
    }),
  };
}

// Utility function to build a complete room broadcast from database items
export function buildRoomBroadcast(
  roomId: string,
  items: RoomItem[],
  customTitle?: string,
  customRoundTitle?: string,
  forceRevealed?: boolean,
): RoomBroadcastBase {
  const room = items.find(isRoomRecord);
  const round = room?.currentRound ?? 1;
  const roundKey = `ROUND#${round.toString().padStart(4, "0")}`;
  const roundItem = items.filter(isRoundRecord).find((i) => i.SK === roundKey);
  const revealed = forceRevealed ?? !!roundItem?.revealed;

  const members = items
    .filter(isMemberRecord)
    .map((m) => ({ memberId: m.memberId, name: m.name, present: m.present }));

  const observers = items
    .filter(isObserverRecord)
    .map((o) => ({
      observerId: o.observerId,
      name: o.name,
      present: o.present,
    }));

  const votePrefix = `VOTE#${round.toString().padStart(4, "0")}#`;
  const voteItems = items
    .filter(isVoteRecord)
    .filter((i) => i.SK.startsWith(votePrefix));
  const currentRoundVotes: Record<string, string | null> = Object.fromEntries(
    members.map((m) => [m.memberId, null]),
  );
  // Always include all votes - let the frontend handle visibility
  for (const v of voteItems) {
    currentRoundVotes[v.memberId] = v.value ?? null;
  }

  // Collect round history with votes
  const roundHistory: RoundHistory[] = items
    .filter(isRoundRecord)
    .filter((i) => i.SK !== roundKey)
    .map((r) => {
      const roundNum = parseInt(r.SK.replace("ROUND#", ""));
      const historyVotePrefix = `VOTE#${roundNum.toString().padStart(4, "0")}#`;
      const historyVoteItems = items
        .filter(isVoteRecord)
        .filter((i) => i.SK.startsWith(historyVotePrefix));

      // Build historical votes - show all votes for completed rounds
      const historicalVotes: Record<string, string | null> = Object.fromEntries(
        members.map((m) => [m.memberId, null]),
      );
      for (const v of historyVoteItems) {
        historicalVotes[v.memberId] = v.value ?? null;
      }

      return {
        roundNumber: roundNum,
        title: r.title || `Round ${roundNum}`,
        revealed: !!r.revealed,
        completedAt: r.completedAt,
        votes: historicalVotes,
      };
    })
    .sort((a, b) => b.roundNumber - a.roundNumber);

  return {
    type: "room",
    roomId,
    title: customTitle ?? room?.title ?? "New Room",
    currentRound: round,
    roundTitle: customRoundTitle ?? roundItem?.title ?? `Round ${round}`,
    revealed,
    members,
    observers,
    currentRoundVotes,
    roundHistory,
  };
}

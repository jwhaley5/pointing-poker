export type ParticipantRole = "member" | "observer";

export interface DbRecord extends Record<string, unknown> {
  PK: string;
  SK: string;
}

export interface RoomRecord extends DbRecord {
  SK: "ROOM";
  roomId: string;
  title: string;
  currentRound: number;
  roundsCount: number;
  createdAt: number;
  ttl: number;
  schemaVersion?: number;
}

export interface RoundRecord extends DbRecord {
  round: number;
  title: string;
  revealed: boolean;
  createdAt: number | string;
  ttl: number;
  completedAt?: string;
  revealedAt?: number;
}

export interface MemberRecord extends DbRecord {
  memberId: string;
  name: string;
  present: boolean;
  joinedAt: number;
  ttl: number;
}

export interface ObserverRecord extends DbRecord {
  observerId: string;
  name: string;
  present: boolean;
  joinedAt: number;
  ttl: number;
}

export interface VoteRecord extends DbRecord {
  round: number;
  memberId: string;
  value: string | null;
  ttl: number;
}

export interface RoomConnectionRecord extends DbRecord {
  connectionId: string;
  participantId: string;
  role: ParticipantRole;
  ttl: number;
}

export interface ConnectionMetaRecord extends DbRecord {
  SK: "META";
  connectionId: string;
  domainName?: string;
  stage?: string;
  roomId?: string;
  participantId?: string;
  role?: ParticipantRole;
  ttl: number;
}

export type RoomItem =
  | RoomRecord
  | RoundRecord
  | MemberRecord
  | ObserverRecord
  | VoteRecord
  | RoomConnectionRecord;

export interface WebSocketResponse {
  statusCode: number;
  body?: string;
  headers?: Record<string, string>;
}

export interface ParticipantContext {
  connectionId: string;
  roomId: string;
  participantId: string;
  role: ParticipantRole;
}

export const isRoomRecord = (item: RoomItem): item is RoomRecord =>
  item.SK === "ROOM";

export const isRoundRecord = (item: RoomItem): item is RoundRecord =>
  item.SK.startsWith("ROUND#");

export const isMemberRecord = (item: RoomItem): item is MemberRecord =>
  item.SK.startsWith("MEMBER#");

export const isObserverRecord = (item: RoomItem): item is ObserverRecord =>
  item.SK.startsWith("OBSERVER#");

export const isVoteRecord = (item: RoomItem): item is VoteRecord =>
  item.SK.startsWith("VOTE#");

export const isRoomConnectionRecord = (
  item: RoomItem,
): item is RoomConnectionRecord => item.SK.startsWith("CONN#");

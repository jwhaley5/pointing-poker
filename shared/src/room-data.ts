// Core member data structure
export interface Member {
  memberId: string
  name: string
  present: boolean
}

// Historical round data
export interface RoundHistory {
  roundNumber: number
  title: string
  revealed: boolean
  completedAt?: string
  votes: Record<string, string | null>
}

// Base room data without personalization
export interface RoomBroadcastBase {
  type: 'room'
  roomId: string
  title: string
  currentRound: number
  roundTitle: string
  revealed: boolean
  members: Member[]
  currentRoundVotes: Record<string, string | null>
  roundHistory: RoundHistory[]
}

// Main room broadcast message sent via WebSocket (includes personalized data)
export interface RoomBroadcast extends RoomBroadcastBase {
  currentMemberId: string
}
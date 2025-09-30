// Re-export shared types
export type { 
  Member, 
  Snapshot, 
  RoundHistory, 
  ClientMessage,
  SyncMessage,
  JoinMessage,
  VoteMessage,
  RevealMessage,
  StartRoundMessage,
  SetRoomTitleMessage,
  SetRoundTitleMessage
} from '@pointing-poker/shared-types'
import type { Snapshot } from '@pointing-poker/shared-types'

export interface WebSocketContextType {
  socket: WebSocket | null
  wsReady: boolean
  send: (payload: any) => void
  snap: Snapshot | null
  setSnap: React.Dispatch<React.SetStateAction<Snapshot | null>>
}

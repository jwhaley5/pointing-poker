// WebSocket message types for all possible actions

// Client -> Server messages
export interface JoinMessage {
  action: 'join'
  roomId: string
  name: string
}

export interface VoteMessage {
  action: 'vote'
  roomId: string
  value: string | null
}

export interface RevealMessage {
  action: 'reveal'
  roomId: string
}

export interface StartRoundMessage {
  action: 'startRound'
  roomId: string
  title?: string
}

export interface SetRoomTitleMessage {
  action: 'setRoomTitle'
  roomId: string
  title: string
}

export interface SetRoundTitleMessage {
  action: 'setRoundTitle'
  roomId: string
  title: string
}

export interface SyncMessage {
  action: 'sync'
  roomId: string
}

// Union type for all possible client messages
export type ClientMessage = 
  | JoinMessage
  | VoteMessage 
  | RevealMessage
  | StartRoundMessage
  | SetRoomTitleMessage
  | SetRoundTitleMessage
  | SyncMessage

// Server -> Client messages (broadcasts)
export interface ConnectionResponse {
  type: 'connected'
}

export interface ErrorResponse {
  type: 'error'
  message: string
}

// Union type for all possible server messages
export type ServerMessage = ConnectionResponse | ErrorResponse
export type Member = {
  memberId: string
  name: string
  present: boolean
}

export type Snapshot = {
  type: 'room'
  roomId: string
  title: string
  currentRound: number
  roundTitle: string
  revealed: boolean
  members: Array<Member>
  votes: Record<string, string | null>
  currentMemberId: string
}

export interface WebSocketContextType {
  socket: WebSocket | null
  wsReady: boolean
  send: (payload: any) => void
  snap: Snapshot | null
  setSnap: React.Dispatch<React.SetStateAction<Snapshot | null>>
}

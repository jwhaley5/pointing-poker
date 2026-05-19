import type { ClientMessage, Snapshot } from "@pointing-poker/shared-types"

export interface WebSocketContextType {
  socket: WebSocket | null
  wsReady: boolean
  send: (payload: ClientMessage) => void
  snap: Snapshot | null
  setSnap: React.Dispatch<React.SetStateAction<Snapshot | null>>
}

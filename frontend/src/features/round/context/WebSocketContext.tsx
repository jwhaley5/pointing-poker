import { createContext, useContext } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import type { WebSocketContextType } from '../types'

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({
  children,
  roomId,
}: {
  children: React.ReactNode
  roomId: string
}) {
  const websocket = useWebSocket(roomId)

  return (
    <WebSocketContext.Provider value={websocket}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error(
      'useWebSocketContext must be used within a WebSocketProvider',
    )
  }
  return context
}

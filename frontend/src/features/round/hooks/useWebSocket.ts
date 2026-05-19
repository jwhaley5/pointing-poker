import { useEffect, useRef, useState } from "react"
import type {
  ClientMessage,
  ServerMessage,
  Snapshot,
  SyncMessage,
} from "@pointing-poker/shared-types"


export function useWebSocket(roomId: string) {
  const [wsReady, setWsReady] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(null)

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL)
    socketRef.current = ws

    const onOpen = () => {
      setWsReady(true)
      const syncMessage = { action: "sync", roomId } satisfies SyncMessage
      ws.send(JSON.stringify(syncMessage))
    }

    const onMessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data) as ServerMessage
        if (msg?.type === "room") {
          const snapshot = msg as Snapshot
          setSnap(snapshot)
        }
      } catch {
        // Ignore malformed messages
      }
    }

    const onClose = () => setWsReady(false)

    const onError = (e: Event) => {
      console.error("WebSocket error:", e)
    }

    ws.addEventListener("open", onOpen)
    ws.addEventListener("message", onMessage)
    ws.addEventListener("close", onClose)
    ws.addEventListener("error", onError)

    return () => {
      ws.removeEventListener("open", onOpen)
      ws.removeEventListener("message", onMessage)
      ws.removeEventListener("close", onClose)
      ws.removeEventListener("error", onError)
      if (socketRef.current === ws) {
        socketRef.current = null
      }
      ws.close()
    }
  }, [roomId])

  const send = (payload: ClientMessage) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify(payload))
  }

  return {
    socket: socketRef.current,
    wsReady,
    send,
    snap,
    setSnap,
  }
}

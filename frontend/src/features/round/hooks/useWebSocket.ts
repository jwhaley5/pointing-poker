import { useEffect, useState } from 'react'
import type { Snapshot } from '../types'

export function useWebSocket(roomId: string) {
  const [wsReady, setWsReady] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(null)

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL)
    setSocket(ws)

    const onOpen = () => {
      setWsReady(true)
      ws.send(JSON.stringify({ action: 'sync', roomId }))
    }

    const onMessage = (e: MessageEvent) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg?.type === 'room') {
          const snapshot = msg as Snapshot
          setSnap(snapshot)
        }
      } catch {
        // Ignore malformed messages
      }
    }

    const onClose = () => setWsReady(false)

    const onError = (e: Event) => {
      console.error('WebSocket error:', e)
    }

    ws.addEventListener('open', onOpen)
    ws.addEventListener('message', onMessage)
    ws.addEventListener('close', onClose)
    ws.addEventListener('error', onError)

    return () => {
      ws.removeEventListener('open', onOpen)
      ws.removeEventListener('message', onMessage)
      ws.removeEventListener('close', onClose)
      ws.removeEventListener('error', onError)
      ws.close()
    }
  }, [roomId])

  const send = (payload: any) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify(payload))
  }

  return {
    socket,
    wsReady,
    send,
    snap,
    setSnap,
  }
}

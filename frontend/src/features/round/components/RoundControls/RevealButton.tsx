import { useWebSocketContext } from '../../context/WebSocketContext'
import type { Snapshot } from '../../types'

interface RevealButtonProps {
  roomId: string
  snap: Snapshot
}

export function RevealButton({ roomId, snap }: RevealButtonProps) {
  const { send } = useWebSocketContext()

  const handleReveal = () => {
    send({ action: 'reveal', roomId })
  }

  return (
    <button
      className="btn btn-accent"
      onClick={handleReveal}
      disabled={snap.revealed}
    >
      Reveal
    </button>
  )
}

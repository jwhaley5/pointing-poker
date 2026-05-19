import { useWebSocketContext } from "../../context/WebSocketContext"
import type { Snapshot } from "@pointing-poker/shared-types"

interface RevealButtonProps {
  roomId: string
  snap: Snapshot
}

export function RevealButton({ roomId, snap }: RevealButtonProps) {
  const { send } = useWebSocketContext()

  const handleReveal = () => {
    send({ action: "reveal", roomId })
  }

  return (
    <button
      className="btn btn-accent min-h-12 w-full sm:w-auto"
      onClick={handleReveal}
      disabled={snap.revealed}
    >
      Reveal
    </button>
  )
}

import { useWebSocketContext } from "../../context/WebSocketContext"

interface NextRoundFormProps {
  roomId: string
}

export function NextRoundForm({ roomId }: NextRoundFormProps) {
  const { send, snap } = useWebSocketContext()

  const handleStartRound = () => {
    send({
      action: "startRound",
      roomId,
    })
  }

  return (
    <div className="join w-full sm:w-auto">
      <button
        className="btn btn-warning join-item min-h-12 w-full whitespace-nowrap sm:w-auto"
        onClick={handleStartRound}
        disabled={snap?.revealed === false}
      >
        Clear Votes
      </button>
    </div>
  )
}

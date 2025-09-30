import { useWebSocketContext } from '../../context/WebSocketContext'

interface NextRoundFormProps {
  roomId: string
}

export function NextRoundForm({ roomId }: NextRoundFormProps) {
  const { send, snap } = useWebSocketContext()

  const handleStartRound = () => {
    send({
      action: 'startRound',
      roomId,
    })
  }

  return (
    <div className="join">
      <button
        className="btn btn-warning join-item"
        onClick={handleStartRound}
        disabled={snap?.revealed === false}
      >
        Clear Votes
      </button>
    </div>
  )
}

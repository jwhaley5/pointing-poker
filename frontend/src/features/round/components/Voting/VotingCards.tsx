import { useWebSocketContext } from '../../context/WebSocketContext'
import type { Snapshot, VoteMessage } from '../../types'

interface VotingCardsProps {
  roomId: string
  snap: Snapshot
}

const CARDS = [
  '0',
  '0.5',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '20',
  '40',
  '100',
  '?',
  '☕',
]

export function VotingCards({ roomId, snap }: VotingCardsProps) {
  const { send, setSnap } = useWebSocketContext()

  const cast = (value: string | null) => {
    // Optimistic update - immediately show the vote locally
    setSnap((prev: Snapshot | null) =>
      prev
        ? {
            ...prev,
            currentRoundVotes: { ...prev.currentRoundVotes, [prev.currentMemberId]: value },
          }
        : prev,
    )

    // Send to server
    const voteMessage: VoteMessage = { action: 'vote', roomId, value }
    send(voteMessage)
  }

  return (
    <div className="card bg-base-200 p-4">
      <div className="flex flex-wrap gap-2">
        {CARDS.map((c) => {
          const isSelected = snap.currentRoundVotes[snap.currentMemberId] === c
          return (
            <button
              key={c}
              className={`btn ${isSelected ? 'btn-primary' : ''}`}
              onClick={() => cast(c)}
            >
              {c}
            </button>
          )
        })}
        <button
          className={`btn btn-ghost ${snap.currentRoundVotes[snap.currentMemberId] === null ? 'btn-active' : ''}`}
          onClick={() => cast(null)}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

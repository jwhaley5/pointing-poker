import { useWebSocketContext } from "../../context/WebSocketContext"
import type { Snapshot, VoteMessage } from "@pointing-poker/shared-types"

interface VotingCardsProps {
  roomId: string
  snap: Snapshot
}

const CARDS = ["1", "2", "3", "5", "8", "13", "21", "34", "55"]

export function VotingCards({ roomId, snap }: VotingCardsProps) {
  const { send, setSnap } = useWebSocketContext()

  const cast = (value: string | null) => {
    if (!snap.currentMemberId) return
    setSnap((prev: Snapshot | null) =>
      prev && prev.currentMemberId
        ? {
            ...prev,
            currentRoundVotes: {
              ...prev.currentRoundVotes,
              [prev.currentMemberId]: value,
            },
          }
        : prev,
    )
    const voteMessage: VoteMessage = { action: "vote", roomId, value }
    send(voteMessage)
  }

  if (!snap.currentMemberId) {
    return null
  }

  return (
    <div className="card bg-base-200 p-4">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {CARDS.map((c) => {
          const isSelected = snap.currentRoundVotes[snap.currentMemberId!] === c
          return (
            <button
              key={c}
              className={`btn ${isSelected ? "btn-primary" : ""}`}
              onClick={() => cast(c)}
            >
              {c}
            </button>
          )
        })}
        <button
          className={`btn btn-ghost ${snap.currentRoundVotes[snap.currentMemberId!] === null ? "btn-active" : ""}`}
          onClick={() => cast(null)}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

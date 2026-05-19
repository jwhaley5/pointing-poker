import { VoteRow } from "./VoteRow"
import { useWebSocketContext } from "../../context/WebSocketContext"
import { calculateAverage, closestCard } from "../../utils"

export function VoteResults() {
  const { snap } = useWebSocketContext()

  const showVotes = snap?.revealed
  return (
    <div className="card bg-base-200 p-4">
      <h3 className="mb-2 flex items-center gap-2 font-semibold">
        Votes
        {!snap?.revealed && <span className="text-sm opacity-70">(hidden)</span>}
      </h3>
      <ul className="divide-y">
        {snap?.members
          .filter((member) => member.present)
          .map((member) => (
            <VoteRow
              key={member.memberId}
              member={member}
              snap={snap}
              showVote={showVotes}
            />
          ))}
      </ul>

      {showVotes && (
        <div className="mt-3 text-sm">
          <p className="flex flex-wrap items-center gap-2">
            Average:
            <span className="text-lg font-bold text-primary">
              {calculateAverage(snap).toFixed(2)} (
              {closestCard(calculateAverage(snap))})
            </span>
          </p>
        </div>
      )}

      {snap?.observers && snap?.observers?.length > 0 && (
        <div className="mt-4 border-t border-base-300 pt-3">
          <h4 className="mb-2 text-sm font-medium opacity-70">Observers</h4>
          <ul className="text-sm opacity-70">
            {snap.observers
              .filter((observer) => observer.present)
              .map((observer) => (
                <li key={observer.observerId} className="py-1">
                  {observer.name}
                  {snap.currentObserverId === observer.observerId && (
                    <span className="badge badge-secondary badge-xs ml-2">
                      You
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

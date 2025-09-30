import { VoteRow } from './VoteRow'
import type { Snapshot } from '../../types'

interface VoteResultsProps {
  snap: Snapshot
}

export function VoteResults({ snap }: VoteResultsProps) {
  const calculateAverage = () => {
    const activeMembers = snap.members
      .filter((m) => m.present)
      .map((m) => m.memberId)
    const votes = Object.entries(snap.currentRoundVotes).filter(([memberId]) =>
      activeMembers.includes(memberId),
    )
    if (votes.length === 0) return '—'
    const votesNumbers = votes
      .map(([, v]) => v)
      .filter((v) => v != null)
      .map((item) => Number(item))

    const avg = votesNumbers.reduce((a, b) => a + b, 0) / votesNumbers.length
    return avg.toFixed(2)
  }

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="font-semibold mb-2">
        Votes {snap.revealed ? '' : '(hidden)'}
      </h3>
      <ul className="divide-y">
        {snap.members
          .filter((member) => member.present)
          .map((member) => (
            <VoteRow key={member.memberId} member={member} snap={snap} />
          ))}
      </ul>

      {snap.revealed && (
        <div className="mt-3 text-sm opacity-80">
          Average (numbers only): {calculateAverage()}
        </div>
      )}
    </div>
  )
}

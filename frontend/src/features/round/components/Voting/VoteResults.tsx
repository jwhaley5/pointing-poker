import { VoteRow } from './VoteRow'
import type { Snapshot } from '../../types'

interface VoteResultsProps {
  snap: Snapshot
}

export function VoteResults({ snap }: VoteResultsProps) {
  const calculateAverage = () => {
    const nums = Object.values(snap.votes)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n))
    if (!nums.length) return '—'
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length
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

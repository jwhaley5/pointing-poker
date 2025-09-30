import type { Snapshot } from '../../types'

interface MembersSidebarProps {
  snap: Snapshot
}

export function MembersSidebar({ snap }: MembersSidebarProps) {
  return (
    <aside className="space-y-4">
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-2">Members</h3>
        <ul className="list-disc ml-5">
          {snap.members
            .filter((member) => member.present)
            .map((member) => (
              <li
                key={member.memberId}
                className={
                  member.memberId === snap.currentMemberId
                    ? 'font-bold text-primary'
                    : ''
                }
              >
                {member.name}
                {member.memberId === snap.currentMemberId ? ' (You)' : ''}
              </li>
            ))}
        </ul>
      </div>
      <div className="card bg-base-200 p-4">
        <h3 className="font-semibold mb-2">Round History</h3>
        {snap.roundHistory.length === 0 ? (
          <p className="text-sm opacity-70">No completed rounds yet</p>
        ) : (
          <ul className="space-y-1">
            {snap.roundHistory.map((round) => (
              <li
                key={round.roundNumber}
                className="text-sm p-2 bg-base-300 rounded cursor-pointer hover:bg-base-100"
                title={`Click to view Round ${round.roundNumber} details`}
              >
                <div className="font-medium">Round {round.roundNumber}</div>
                <div className="text-xs opacity-70 truncate">{round.title}</div>
                {round.completedAt && (
                  <div className="text-xs opacity-50">
                    {new Date(round.completedAt).toLocaleDateString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}

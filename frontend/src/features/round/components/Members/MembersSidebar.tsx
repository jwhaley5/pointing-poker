import type { Snapshot } from '../../types'

interface MembersSidebarProps {
  snap: Snapshot
}

export function MembersSidebar({ snap }: MembersSidebarProps) {
  console.log(snap)
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
        <h3 className="font-semibold mb-2">History</h3>
        <ul className="list-disc ml-5">
          {snap.members.map((member) => (
            <li key={member.memberId}>{member.name}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

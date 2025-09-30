import { FaCheck, FaDotCircle } from 'react-icons/fa'
import type { Member, Snapshot } from '../../types'

interface VoteRowProps {
  member: Member
  snap: Snapshot
}

export function VoteRow({ member, snap }: VoteRowProps) {
  const isCurrentUser = member.memberId === snap.currentMemberId

  return (
    <li
      className={`p-2 flex items-center justify-between ${isCurrentUser ? 'bg-primary/10' : ''}`}
    >
      <span className={isCurrentUser ? 'font-bold text-primary' : ''}>
        {member.name}
        {isCurrentUser ? ' (You)' : ''}
      </span>
      <span
        className={`badge badge-lg flex items-center justify-center ${isCurrentUser ? 'badge-primary text-lg' : 'badge-neutral'}`}
      >
        {snap.revealed || isCurrentUser ? (
          (snap.votes[member.memberId] ?? '—')
        ) : snap.votes[member.memberId] != null ? (
          <FaCheck />
        ) : (
          <FaDotCircle />
        )}
      </span>
    </li>
  )
}

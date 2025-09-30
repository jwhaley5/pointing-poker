import { FaCheck, FaDotCircle } from 'react-icons/fa'
import type { Member, Snapshot } from '../../types'

interface VoteRowProps {
	member: Member
	snap: Snapshot
	showVote?: boolean
}

export function VoteRow({ member, snap, showVote }: VoteRowProps) {
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
				{showVote || isCurrentUser ? (
					(snap.currentRoundVotes[member.memberId] ?? '—')
				) : snap.currentRoundVotes[member.memberId] != null ? (
					<FaCheck />
				) : (
					<FaDotCircle />
				)}
			</span>
		</li>
	)
}

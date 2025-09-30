import { useWebSocketContext } from '../../context/WebSocketContext'
import type { Snapshot, VoteMessage } from '../../types'

interface VotingCardsProps {
	roomId: string
	snap: Snapshot
}

const CARDS = [
	'0',
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
		if (!snap.currentMemberId) return
		setSnap((prev: Snapshot | null) =>
			prev && prev.currentMemberId
				? {
					...prev,
					currentRoundVotes: { ...prev.currentRoundVotes, [prev.currentMemberId]: value },
				}
				: prev,
		)
		const voteMessage: VoteMessage = { action: 'vote', roomId, value }
		send(voteMessage)
	}

	if (!snap.currentMemberId) {
		return null
	}

	return (
		<div className="card bg-base-200 p-4">
			<div className="flex flex-wrap gap-2">
				{CARDS.map((c) => {
					const isSelected = snap.currentRoundVotes[snap.currentMemberId!] === c
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
					className={`btn btn-ghost ${snap.currentRoundVotes[snap.currentMemberId!] === null ? 'btn-active' : ''}`}
					onClick={() => cast(null)}
				>
					Clear
				</button>
			</div>
		</div>
	)
}

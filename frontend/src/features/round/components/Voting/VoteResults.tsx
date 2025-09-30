import { VoteRow } from './VoteRow'
import type { Snapshot } from '../../types'
import { useWebSocketContext } from '../../context/WebSocketContext'

export const calculateAverage = (snap: Snapshot) => {
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

export function VoteResults() {

	const { snap } = useWebSocketContext()

	const showVotes = snap?.revealed;
	return (
		<div className="card bg-base-200 p-4">
			<h3 className="font-semibold mb-2 flex items-center gap-2">
				Votes
				{!snap?.revealed && (
					<span className="text-sm opacity-70">(hidden)</span>
				)}
			</h3>
			<ul className="divide-y">
				{snap?.members
					.filter((member) => member.present)
					.map((member) => (
						<VoteRow key={member.memberId} member={member} snap={snap} showVote={showVotes} />
					))}
			</ul>

			{showVotes && (
				<div className="mt-3 text-sm opacity-80">
					Average (numbers only): {calculateAverage(snap)}
				</div>
			)}

			{snap?.observers && snap?.observers?.length > 0 && (
				<div className="mt-4 pt-3 border-t border-base-300">
					<h4 className="font-medium text-sm mb-2 opacity-70">Observers</h4>
					<ul className="text-sm opacity-70">
						{snap.observers
							.filter((observer) => observer.present)
							.map((observer) => (
								<li key={observer.observerId} className="py-1">
									{observer.name}
									{snap.currentObserverId === observer.observerId && (
										<span className="ml-2 badge badge-secondary badge-xs">You</span>
									)}
								</li>
							))}
					</ul>
				</div>
			)}
		</div>
	)
}

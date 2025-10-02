import { VoteRow } from './VoteRow'
import { useWebSocketContext } from '../../context/WebSocketContext'
import { calculateAverage, closestCard } from '../../utils';

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
				<div className="mt-1 text-sm flex gap-1 flex-col">
					<p className="text-center flex items-center gap-2">Average: <span className="text-lg text-primary font-bold">{calculateAverage(snap).toFixed(2)} ({closestCard(calculateAverage(snap))})</span></p>
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

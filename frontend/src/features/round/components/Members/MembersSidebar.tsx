import type { Snapshot } from '../../types'
import { calculateAverageFromVotes, closestCard } from '../../utils'

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

				{snap.observers.length > 0 && (
					<>
						<h4 className="font-medium mt-4 mb-2 text-sm">Observers</h4>
						<ul className="list-disc ml-5 text-sm opacity-70">
							{snap.observers
								.filter((observer) => observer.present)
								.map((observer) => (
									<li
										key={observer.observerId}
										className={
											observer.observerId === snap.currentObserverId
												? 'font-bold text-secondary'
												: ''
										}
									>
										{observer.name}
										{observer.observerId === snap.currentObserverId ? ' (You)' : ''}
									</li>
								))}
						</ul>
					</>
				)}
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
								className="text-sm p-2 bg-base-300 rounded hover:bg-base-100"
							>
								<div className="truncate">{round.title}</div>
								{round.completedAt && (
									<div className="text-base-content/50">
										Finished: {new Date(round.completedAt).toLocaleString("en-US", {
											dateStyle: "short",
											timeStyle: "short",
										})}
									</div>
								)}
								<div className="flex text-base-content/50 items-center text-center gap-1">
									<p>Average: <span className="text-primary font-bold">{calculateAverageFromVotes(round.votes)?.toFixed(2)} ({closestCard(calculateAverageFromVotes(round.votes) ?? 0)})</span></p>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</aside>
	)
}


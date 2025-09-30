import { useWebSocketContext } from '../context/WebSocketContext'
import { RoomHeader } from './RoomHeader/RoomHeader'
import { RoundControls } from './RoundControls/RoundControls'
import { VotingCards } from './Voting/VotingCards'
import { VoteResults } from './Voting/VoteResults'
import { MembersSidebar } from './Members/MembersSidebar'

interface RoomInterfaceProps {
	roomId: string
}

export function RoomInterface({ roomId }: RoomInterfaceProps) {
	const { snap } = useWebSocketContext()

	if (!snap) {
		return (
			<div className="alert">
				<span>Waiting for room state…</span>
			</div>
		)
	}

	const isMember = !!snap.currentMemberId

	return (
		<>
			<RoomHeader roomId={roomId} />

			<div className="grid md:grid-cols-3 gap-4">
				<div className="md:col-span-2 space-y-4">
					<RoundControls roomId={roomId} snap={snap} />
					{isMember && <VotingCards roomId={roomId} snap={snap} />}
					<VoteResults />
				</div>
				<MembersSidebar snap={snap} />
			</div>
		</>
	)
}

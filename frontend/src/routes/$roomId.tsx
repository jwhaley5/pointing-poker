import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RoundFeature } from '../features/round/components/RoundFeature'
import {
	setCanonical,
	setDocumentTitle,
	setNamedMeta,
} from '../utils/documentMeta'

export const Route = createFileRoute('/$roomId')({
	component: RoomPage,
})

function RoomPage() {
	const { roomId } = Route.useParams()

	useEffect(() => {
		setDocumentTitle(`Pointing Poker Room ${roomId}`)
		setNamedMeta('robots', 'noindex,nofollow')
		setNamedMeta(
			'description',
			'Private planning poker room for agile story point estimation.',
		)
		setCanonical(`https://pointing.athlorium.com/${roomId}`)
	}, [roomId])

	return (
		<div className="max-w-7xl mx-auto p-4 pt-20 space-y-2">
			<RoundFeature roomId={roomId} />
		</div>
	)
}

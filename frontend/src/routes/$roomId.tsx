import { createFileRoute } from '@tanstack/react-router'
import { RoundFeature } from '../features/round/components/RoundFeature'

export const Route = createFileRoute('/$roomId')({
  component: RoomPage,
})

function RoomPage() {
  const { roomId } = Route.useParams()

  return (
    <div className="max-w-7xl mx-auto p-4 pt-20 space-y-6">
      <RoundFeature roomId={roomId} />
    </div>
  )
}

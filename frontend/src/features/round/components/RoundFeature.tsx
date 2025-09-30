import { useState } from 'react'
import { WebSocketProvider } from '../context/WebSocketContext'
import { JoinScreen } from './JoinScreen'
import { RoomInterface } from './RoomInterface'

interface RoundFeatureProps {
  roomId: string
}

export function RoundFeature({ roomId }: RoundFeatureProps) {
  const [hasJoined, setHasJoined] = useState(false)

  const handleJoinSuccess = () => {
    setHasJoined(true)
  }

  return (
    <WebSocketProvider roomId={roomId}>
      {!hasJoined ? (
        <JoinScreen roomId={roomId} onJoinSuccess={handleJoinSuccess} />
      ) : (
        <RoomInterface roomId={roomId} />
      )}
    </WebSocketProvider>
  )
}

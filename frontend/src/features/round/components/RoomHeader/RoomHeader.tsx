import { useNavigate } from '@tanstack/react-router'
import { useWebSocketContext } from '../../context/WebSocketContext'
import { RoomTitle } from './RoomTitle'
import { ConnectionStatus } from './ConnectionStatus'

interface RoomHeaderProps {
  roomId: string
}

export function RoomHeader({ roomId }: RoomHeaderProps) {
  const navigate = useNavigate()
  const { snap } = useWebSocketContext()

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <RoomTitle roomId={roomId} title={snap?.title} />
        </div>
        <ConnectionStatus />
      </div>
      <div className="flex gap-2">
        <button
          className="btn"
          onClick={() => navigator.clipboard.writeText(location.href)}
        >
          Copy link
        </button>
        <button className="btn btn-ghost" onClick={() => navigate({ to: '/' })}>
          Home
        </button>
      </div>
    </div>
  )
}

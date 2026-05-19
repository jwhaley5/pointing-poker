import { useNavigate } from "@tanstack/react-router"
import { useWebSocketContext } from "../../context/WebSocketContext"
import { RoomTitle } from "./RoomTitle"
import { ConnectionStatus } from "./ConnectionStatus"

interface RoomHeaderProps {
  roomId: string
}

export function RoomHeader({ roomId }: RoomHeaderProps) {
  const navigate = useNavigate()
  const { snap } = useWebSocketContext()

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <RoomTitle roomId={roomId} title={snap?.title} />
        <ConnectionStatus />
      </div>
      <div className="hidden md:grid grid-cols-2 gap-2">
        <button
          className="btn min-h-10"
          onClick={() => navigator.clipboard.writeText(location.href)}
        >
          Copy link
        </button>
        <button
          className="btn btn-ghost min-h-10"
          onClick={() => navigate({ to: "/" })}
        >
          Home
        </button>
      </div>
    </div>
  )
}

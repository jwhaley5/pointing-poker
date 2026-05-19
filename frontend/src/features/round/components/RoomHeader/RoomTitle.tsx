import { useEffect, useState } from "react"
import { useWebSocketContext } from "../../context/WebSocketContext"

interface RoomTitleProps {
  roomId: string
  title?: string
}

export function RoomTitle({ roomId }: RoomTitleProps) {
  const { send, snap } = useWebSocketContext()
  const [editValue, setEditValue] = useState(snap?.title || "")

  useEffect(() => {
    if (snap?.title) setEditValue(snap.title)
  }, [snap?.title])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleBlur = () => {
    if (editValue.trim()) {
      send({ action: "setRoomTitle", roomId, title: editValue.trim() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
    if (e.key === "Escape") {
      setEditValue(snap?.title || "")
      e.currentTarget.blur()
    }
  }

  return (
    <div className="mb-2 flex min-w-0 flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">
        Room Name
      </h2>
      <input
        className="input input-bordered h-12 w-full max-w-full text-2xl font-bold sm:w-80"
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={snap?.title || `Room ${roomId}`}
      />
    </div>
  )
}

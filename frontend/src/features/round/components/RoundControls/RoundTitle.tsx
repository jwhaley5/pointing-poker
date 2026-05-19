import { useEffect, useState } from "react"
import { useWebSocketContext } from "../../context/WebSocketContext"

interface RoundTitleProps {
  roomId: string
}

export function RoundTitle({ roomId }: RoundTitleProps) {
  const { send, snap } = useWebSocketContext()
  const [editValue, setEditValue] = useState(snap?.roundTitle ?? "")

  // Only sync from server when not actively editing
  useEffect(() => {
    if (snap?.roundTitle) setEditValue(snap.roundTitle)
  }, [snap?.roundTitle])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleBlur = () => {
    send({ action: "setRoundTitle", roomId, title: editValue.trim() })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
    if (e.key === "Escape") {
      setEditValue(snap?.roundTitle || "")
      e.currentTarget.blur()
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label className="text-sm font-medium" htmlFor="round-title">
        Story Description
      </label>
      <input
        id="round-title"
        className="input input-bordered h-12 w-full max-w-full"
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="PROJ-123: User login"
      />
    </div>
  )
}

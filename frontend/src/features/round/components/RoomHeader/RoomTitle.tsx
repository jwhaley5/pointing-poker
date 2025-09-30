import { useEffect, useState } from 'react'
import { useWebSocketContext } from '../../context/WebSocketContext'

interface RoomTitleProps {
  roomId: string
  title?: string
}

export function RoomTitle({ roomId }: RoomTitleProps) {
  const { send, snap } = useWebSocketContext()
  const [editValue, setEditValue] = useState(snap?.title || '')

  // Only sync from server when not actively editing
  useEffect(() => {
    if (snap?.title) setEditValue(snap.title)
  }, [snap?.title])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleBlur = () => {
    if (editValue.trim()) {
      send({ action: 'setRoomTitle', roomId, title: editValue.trim() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() // This will trigger handleBlur
    }
    if (e.key === 'Escape') {
      setEditValue(snap?.title || '')
      e.currentTarget.blur()
    }
  }

  return (
    <div className="flex flex-col gap-2 mb-2">
      <h2 className="font-bold">Room Name</h2>
      <input
        className="input input-bordered text-2xl font-bold"
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={snap?.title || `Room ${roomId}`}
        autoFocus
      />
    </div>
  )
}

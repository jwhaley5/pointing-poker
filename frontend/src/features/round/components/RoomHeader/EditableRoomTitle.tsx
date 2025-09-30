import { useEffect, useState } from 'react'
import { useWebSocketContext } from '../../context/WebSocketContext'

interface EditableRoomTitleProps {
  roomId: string
  title?: string
}

export function EditableRoomTitle({ roomId }: EditableRoomTitleProps) {
  const { send, snap } = useWebSocketContext()
  const [editValue, setEditValue] = useState(snap?.title || '')
  const [isEditing, setIsEditing] = useState(false)

  // Only sync from server when not actively editing
  useEffect(() => {
    if (!isEditing && snap?.title) {
      setEditValue(snap.title)
    }
  }, [snap?.title, isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
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
      setIsEditing(false)
      e.currentTarget.blur()
    }
  }

  return (
    <div className="flex items-center gap-2 mb-2">
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

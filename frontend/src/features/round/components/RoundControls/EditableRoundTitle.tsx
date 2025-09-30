import { useEffect, useState } from 'react'
import { useWebSocketContext } from '../../context/WebSocketContext'
import type { Snapshot } from '../../types'

interface EditableRoundTitleProps {
  roomId: string
  snap: Snapshot
}

export function EditableRoundTitle({ roomId, snap }: EditableRoundTitleProps) {
  const { send, setSnap } = useWebSocketContext()
  const [editValue, setEditValue] = useState(snap.roundTitle)
  const [isEditing, setIsEditing] = useState(false)

  // Only sync from server when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setEditValue(snap.roundTitle)
    }
  }, [snap.roundTitle, isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
    setIsEditing(true)
  }

  const updateTitle = () => {
    setIsEditing(false)
    if (!editValue.trim()) return

    // Optimistic update - immediately show the new round title
    setSnap((prev: Snapshot | null) =>
      prev
        ? {
            ...prev,
            roundTitle: editValue.trim(),
          }
        : prev,
    )

    // Send to server
    send({ action: 'setRoundTitle', roomId, title: editValue.trim() })
  }

  const cancelEditing = () => {
    setEditValue(snap.roundTitle)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateTitle()
    }
    if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      <input
        className="input input-bordered input-sm flex-1"
        value={editValue}
        onChange={handleInputChange}
        onBlur={updateTitle}
        onKeyDown={handleKeyDown}
        autoFocus
        placeholder="Enter story title (e.g., PROJ-123: User login)"
      />
      <button className="btn btn-sm btn-primary" onClick={updateTitle}>
        Save
      </button>
      <button className="btn btn-sm btn-ghost" onClick={cancelEditing}>
        Cancel
      </button>
    </div>
  )
}

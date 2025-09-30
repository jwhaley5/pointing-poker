import { useState } from 'react'
import { useWebSocketContext } from '../../context/WebSocketContext'

interface NextRoundFormProps {
  roomId: string
}

export function NextRoundForm({ roomId }: NextRoundFormProps) {
  const { send } = useWebSocketContext()
  const [roundTitle, setRoundTitle] = useState('')

  const handleStartRound = () => {
    send({
      action: 'startRound',
      roomId,
      title: roundTitle.trim() || undefined,
    })
    setRoundTitle('')
  }

  return (
    <div className="join">
      <input
        className="input input-bordered join-item"
        placeholder="Next round title"
        value={roundTitle}
        onChange={(e) => setRoundTitle(e.target.value)}
      />
      <button className="btn btn-warning join-item" onClick={handleStartRound}>
        Start next round
      </button>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useWebSocketContext } from '../context/WebSocketContext'

interface JoinScreenProps {
  roomId: string
  onJoinSuccess: () => void
}

export function JoinScreen({ roomId, onJoinSuccess }: JoinScreenProps) {
  const navigate = useNavigate()
  const { wsReady, send, snap } = useWebSocketContext()
  const [name, setName] = useState(localStorage.getItem('pp:name') ?? '')
  const [isJoining, setIsJoining] = useState(false)

  const doJoin = () => {
    if (!name.trim() || isJoining) return
    setIsJoining(true)
    localStorage.setItem('pp:name', name.trim())
    send({ action: 'join', roomId, name: name.trim() })
  }

  // Check if user has successfully joined
  useEffect(() => {
    if (snap?.currentMemberId) {
      const currentMember = snap.members.find(
        (m) => m.memberId === snap.currentMemberId,
      )
      if (currentMember && currentMember.present) {
        setIsJoining(false)
        onJoinSuccess()
      }
    }
  }, [snap, onJoinSuccess])

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Pointing Poker</h1>
        <p className="text-lg mt-2">Room {roomId}</p>
        {snap?.title && <p className="text-sm opacity-70">{snap.title}</p>}
      </div>

      <div className="card bg-base-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Join Room</h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 items-center">
            <label className="label">
              <span className="label-text">
                Enter your name to join the session
              </span>
            </label>
            <input
              className="input input-bordered w-full"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doJoin()}
              autoFocus
            />
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={doJoin}
            disabled={!wsReady || !name.trim() || isJoining}
          >
            {isJoining ? (
              <div className="loading text-primary loading-infinity" />
            ) : (
              'Join Room'
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm opacity-70">
        <div className="inline-grid *:[grid-area:1/1]">
          <div
            className={`status ${wsReady ? 'status-success' : 'status-info'} animate-ping`}
          />
          <div
            className={`status ${wsReady ? 'status-success' : 'status-info'}`}
          />
        </div>
        {wsReady ? 'Connected' : 'Connecting...'}
      </div>

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate({ to: '/' })}
      >
        ← Back to Home
      </button>
    </div>
  )
}

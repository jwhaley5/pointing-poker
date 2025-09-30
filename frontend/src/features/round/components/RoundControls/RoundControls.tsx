import { RoundTitle } from './RoundTitle'
import { RevealButton } from './RevealButton'
import { NextRoundForm } from './NextRoundForm'
import type { Snapshot } from '../../types'

interface RoundControlsProps {
  roomId: string
  snap: Snapshot
}

export function RoundControls({ roomId, snap }: RoundControlsProps) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <RoundTitle roomId={roomId} />

        <div className="flex items-center gap-2">
          <RevealButton roomId={roomId} snap={snap} />
          <NextRoundForm roomId={roomId} />
        </div>
      </div>
    </div>
  )
}

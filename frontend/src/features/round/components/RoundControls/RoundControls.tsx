import { RoundTitle } from "./RoundTitle"
import { RevealButton } from "./RevealButton"
import { NextRoundForm } from "./NextRoundForm"
import type { Snapshot } from "@pointing-poker/shared-types"

interface RoundControlsProps {
  roomId: string
  snap: Snapshot
}

export function RoundControls({ roomId, snap }: RoundControlsProps) {
  return (
    <div className="card bg-base-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <RoundTitle roomId={roomId} />

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:items-center">
          <RevealButton roomId={roomId} snap={snap} />
          <NextRoundForm roomId={roomId} />
        </div>
      </div>
    </div>
  )
}

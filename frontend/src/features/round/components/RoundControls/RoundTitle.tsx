import { useEffect, useState } from 'react'
import { useWebSocketContext } from '../../context/WebSocketContext'

interface RoundTitleProps {
	roomId: string
}

export function RoundTitle({ roomId }: RoundTitleProps) {
	const { send, snap } = useWebSocketContext()
	const [editValue, setEditValue] = useState(snap?.roundTitle ?? '')

	// Only sync from server when not actively editing
	useEffect(() => {
		if (snap?.roundTitle) setEditValue(snap.roundTitle)
	}, [snap?.roundTitle])

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditValue(e.target.value)
	}

	const handleBlur = () => {
		send({ action: 'setRoundTitle', roomId, title: editValue.trim() })
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.currentTarget.blur()
		}
		if (e.key === 'Escape') {
			setEditValue(snap?.title || '')
			e.currentTarget.blur()
		}
	}

	return (
		<div className="flex flex-col gap-1">
			<p className="text-sm">Story Description:</p>
			<input
				className="input input-bordered"
				value={editValue}
				onChange={handleInputChange}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				autoFocus
				placeholder="PROJ-123: User login"
			/>
		</div>
	)
}

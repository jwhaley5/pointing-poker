import { useWebSocketContext } from '../../context/WebSocketContext'

export function ConnectionStatus() {
	const { wsReady } = useWebSocketContext()

	return (
		<div className="flex items-center gap-2">
			<div className="inline-grid *:[grid-area:1/1]">
				<div
					className={`status ${wsReady ? 'status-success' : 'status-info'} animate-ping`}
				/>
				<div
					className={`status ${wsReady ? 'status-success' : 'status-info'}`}
				/>
			</div>
			<p className="text-sm opacity-70">
				{wsReady ? 'Connected' : 'Connecting'}
			</p>
		</div>
	)
}

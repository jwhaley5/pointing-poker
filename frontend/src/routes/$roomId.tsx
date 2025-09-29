import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

type Member = { memberId: string; name: string; present: boolean }
type Snapshot = {
	type: 'room'
	roomId: string
	currentRound: number
	roundTitle: string
	revealed: boolean
	members: Member[]
	votes: Record<string, string | null>
}

export const Route = createFileRoute('/$roomId')({
	component: RoomPage,
})

function RoomPage() {

	const { roomId } = Route.useParams()
	const navigate = useNavigate()

	// basic state
	const [wsReady, setWsReady] = useState(false)
	const [socket, setSocket] = useState<WebSocket | null>(null)
	const [snap, setSnap] = useState<Snapshot | null>(null)
	const [name, setName] = useState(localStorage.getItem('pp:name') ?? '')
	const [roundTitle, setRoundTitle] = useState('')



	console.log(socket);
	// open websocket
	useEffect(() => {
		const ws = new WebSocket(import.meta.env.VITE_WS_URL)
		setSocket(ws)

		const onOpen = () => {
			setWsReady(true)
			ws.send(JSON.stringify({ action: 'sync', roomId }))
		}
		const onMessage = (e: MessageEvent) => {
			try {
				const msg = JSON.parse(e.data)
				if (msg?.type === 'room') setSnap(msg as Snapshot)
			} catch { }
		}
		const onClose = () => setWsReady(false)

		ws.addEventListener('open', onOpen)
		ws.addEventListener('message', onMessage)
		ws.addEventListener('close', onClose)

		return () => {

			ws.removeEventListener('open', onOpen)
			ws.removeEventListener('message', onMessage)
			ws.removeEventListener('close', onClose)

			ws.close()
		}
	}, [roomId])

	// helpers to send actions
	const send = (payload: any) => {
		if (!socket || socket.readyState !== WebSocket.OPEN) return
		socket.send(JSON.stringify(payload))
	}

	const doJoin = () => {
		if (!name.trim()) return
		localStorage.setItem('pp:name', name.trim())
		send({ action: 'join', roomId, name: name.trim() })
	}

	const cast = (value: string | null) => {
		send({ action: 'vote', roomId, value })
	}

	const reveal = () => {
		send({ action: 'reveal', roomId })
	}

	const startRound = () => {
		send({
			action: 'startRound',
			roomId,
			title: roundTitle.trim() || undefined,
		})
		setRoundTitle('')
	}

	// ui helpers
	const CARDS = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕']

	return (
		<div className="max-w-7xl mx-auto p-4 pt-20 space-y-6">
			<header className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Room {roomId}</h1>
					<div className="flex items-center gap-2">
						<div className="inline-grid *:[grid-area:1/1]">
							<div className={`status ${wsReady ? "status-success" : "status-info"} animate-ping`} />
							<div className={`status ${wsReady ? "status-success" : "status-info"} `} />
						</div>
						<p className="text-sm opacity-70">
							{wsReady ? "Connected" : "Connecting"}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						className="btn"
						onClick={() => navigator.clipboard.writeText(location.href)}
					>
						Copy link
					</button>
					<button className="btn btn-ghost" onClick={() => navigate({ to: '/' })}>
						Home
					</button>
				</div>
			</header>

			<div className="card bg-base-200 p-4">
				<div className="flex flex-col sm:flex-row gap-2">
					<input
						className="input input-bordered flex-1"
						placeholder="Enter your name"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<button className="btn btn-primary" onClick={doJoin} disabled={!wsReady || !name}>
						Join
					</button>
				</div>
			</div>

			{/* room view */}
			{snap && (
				<div className="grid md:grid-cols-3 gap-4">
					<div className="md:col-span-2 space-y-4">
						<div className="card bg-base-200 p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<h2 className="font-semibold">
										Round {snap.currentRound}: {snap.roundTitle}
									</h2>
									<p className="text-sm opacity-70">
										{snap.revealed ? 'Votes revealed' : 'Votes hidden'}
									</p>
								</div>

								<div className="flex items-center gap-2">
									<button
										className="btn btn-accent"
										onClick={reveal}
										disabled={snap.revealed}
									>
										Reveal
									</button>
									<div className="join">
										<input
											className="input input-bordered join-item"
											placeholder="Next round title"
											value={roundTitle}
											onChange={(e) => setRoundTitle(e.target.value)}
										/>
										<button className="btn btn-warning join-item" onClick={startRound}>
											Start next round
										</button>
									</div>
								</div>
							</div>
						</div>

						<div className="card bg-base-200 p-4">
							<div className="flex flex-wrap gap-2">
								{CARDS.map((c) => (
									<button key={c} className="btn" onClick={() => cast(c)}>
										{c}
									</button>
								))}
								<button className="btn btn-ghost" onClick={() => cast(null)}>
									Clear
								</button>
							</div>
						</div>

						<div className="card bg-base-200 p-4">
							<h3 className="font-semibold mb-2">
								Votes {snap.revealed ? '' : '(hidden)'}
							</h3>
							<ul className="divide-y">
								{snap.members.filter(item => item.present).map((m) => (
									<VoteRow key={m.memberId} m={m} snap={snap} />
								))}
							</ul>

							{snap.revealed && (
								<div className="mt-3 text-sm opacity-80">
									Average (numbers only):{' '}
									{(() => {
										const nums = Object.values(snap.votes)
											.map((v) => Number(v))
											.filter((n) => !Number.isNaN(n))
										if (!nums.length) return '—'
										const avg = nums.reduce((a, b) => a + b, 0) / nums.length
										return avg.toFixed(2)
									})()}
								</div>
							)}
						</div>
					</div>

					<aside className="space-y-4">
						<div className="card bg-base-200 p-4">
							<h3 className="font-semibold mb-2">Members</h3>
							<ul className="list-disc ml-5">
								{snap.members.filter((item) => item.present).map((m) => (
									<li key={m.memberId}>{m.name}</li>
								))}
							</ul>
						</div>
						<div className="card bg-base-200 p-4">
							<h3 className="font-semibold mb-2">History</h3>
							<ul className="list-disc ml-5">
								{snap.members.map((m) => (
									<li key={m.memberId}>{m.name}</li>
								))}
							</ul>
						</div>

					</aside>
				</div>
			)}

			{/* gentle nudge if joined but haven't received snap yet */}
			{name && !snap && (
				<div className="alert">
					<span>Waiting for room state…</span>
				</div>
			)}
		</div>
	)
}


const VoteRow = ({ m, snap }: { m: Member, snap: Snapshot }) => {
	console.log(snap);
	return (
		<li key={m.memberId} className="py-2 flex items-center justify-between">
			<span>{m.name}</span>
			<span className="badge badge-lg flex items-center justify-center">
				{snap.revealed
					? snap.votes[m.memberId] ?? '—'
					: snap.votes[m.memberId] != null
						? '✔︎'
						: '…'}
			</span>
		</li>
	)
}

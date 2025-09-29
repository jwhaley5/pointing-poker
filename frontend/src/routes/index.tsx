import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FormProvider, useForm } from 'react-hook-form'

export const Route = createFileRoute('/')({
	component: App,
})

function App() {
	const methods = useForm()
	const navigate = useNavigate()

	const onSubmit = (data: any) => {
		const roomId = data.roomId?.trim()
		if (roomId) {
			navigate({ to: "/$roomId", params: { roomId } })
		}
	}

	const createRoom = async () => {
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
				method: 'POST',
			})
			if (!res.ok) throw new Error('Failed to create room')
			const { roomId, adminToken } = await res.json()

			// store admin token locally so creator can reveal/reset later
			localStorage.setItem(`adminToken:${roomId}`, adminToken)

			// redirect to room
			navigate({ to: "/$roomId", params: { roomId } })
		} catch (err) {
			console.error('Error creating room', err)
			alert('Could not create room, check console/logs.')
		}
	}

	return (
		<div className="flex text-base-content min-h-[80vh] flex-col items-center justify-center text-center">
			<FormProvider {...methods}>
				<form
					className="flex items-center gap-2"
					onSubmit={methods.handleSubmit(onSubmit)}
				>
					<input
						{...methods.register('roomId')}
						placeholder="Enter Room ID"
						className="input"
					/>
					<button type="submit" className="btn btn-secondary">
						Submit
					</button>
				</form>
			</FormProvider>

			<div className="my-4">Or</div>

			<button className="btn btn-primary" type="button" onClick={createRoom}>
				Create a room
			</button>
		</div>
	)
}

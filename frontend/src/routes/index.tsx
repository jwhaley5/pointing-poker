import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { GiPokerHand } from 'react-icons/gi'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const methods = useForm()
  const navigate = useNavigate()

  const [creating, setCreating] = useState(false)

  const onSubmit = (data: any) => {
    const roomId = data.roomId?.trim()
    if (roomId) {
      navigate({ to: '/$roomId', params: { roomId } })
    }
  }

  const createRoom = async () => {
    try {
      setCreating(true)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to create room')
      const { roomId } = await res.json()

      // redirect to room
      navigate({ to: '/$roomId', params: { roomId } })
    } catch (err) {
      console.error('Error creating room', err)
      alert('Could not create room, check console/logs.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-radial min-h-screen from-base-100/20 via-primary/20 to-accent/20">
      <div className="bg-base-100/80 backdrop-blur-md h-max rounded-lg shadow-lg p-6 md:p-24 flex flex-col gap-8 justify-center items-center text-center ">
        <div className="text-5xl font-bold flex items-center gap-2 text-primary">
          <GiPokerHand size="6rem" />
          <h1>Pointing Poker</h1>
        </div>
        <FormProvider {...methods}>
          <form
            className="flex items-center gap-2"
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <input
              {...methods.register('roomId')}
              placeholder="Room ID"
              className="input"
            />
            <button type="submit" className="btn btn-secondary">
              Join Room
            </button>
          </form>
        </FormProvider>

        <div>- Or -</div>

        <button
          disabled={creating}
          className="btn btn-primary"
          type="button"
          onClick={createRoom}
        >
          {creating ? (
            <div className="loading loading-infinity text-primary" />
          ) : (
            'Create a room'
          )}
        </button>
      </div>
    </div>
  )
}

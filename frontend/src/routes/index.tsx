import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { GiPokerHand } from "react-icons/gi"
import {
  setCanonical,
  setDocumentTitle,
  setNamedMeta,
} from "../utils/documentMeta"

export const Route = createFileRoute("/")({
  component: App,
})

interface JoinRoomForm {
  roomId: string
}

const features = [
  {
    title: "Real-time scrum poker",
    description:
      "Create a room, invite your team, vote privately, then reveal estimates together.",
  },
  {
    title: "Built for story points",
    description:
      "Use a familiar Fibonacci-style deck for backlog refinement and sprint planning.",
  },
  {
    title: "No signup required",
    description:
      "Start an estimation session from the browser without accounts, installs, or setup.",
  },
]

const faqs = [
  {
    question: "What is planning poker?",
    answer:
      "Planning poker is an agile estimation technique where team members vote on the effort of a story, reveal estimates together, and discuss differences before agreeing on a final point value.",
  },
  {
    question: "Is this the same as scrum poker?",
    answer:
      "Yes. Planning poker and scrum poker usually refer to the same collaborative estimation workflow used by agile teams during refinement or sprint planning.",
  },
  {
    question: "Can remote teams use it?",
    answer:
      "Yes. Pointing Poker runs in the browser and keeps votes synchronized in real time, so distributed teams can estimate together on a call.",
  },
  {
    question: "Do we need accounts?",
    answer:
      "No. Rooms can be created and shared immediately, which keeps lightweight estimation sessions fast for teams and guests.",
  },
]

function App() {
  const methods = useForm<JoinRoomForm>()
  const navigate = useNavigate()

  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    setDocumentTitle("Pointing Poker | Free Planning Poker for Agile Teams")
    setNamedMeta("robots", "index,follow")
    setNamedMeta(
      "description",
      "Free online planning poker for agile teams. Estimate story points, run scrum poker sessions, and align remote teams in real time without signups.",
    )
    setCanonical("https://pointing.athlorium.com/")
  }, [])

  const onSubmit = (data: JoinRoomForm) => {
    const roomId = data.roomId?.trim()
    if (roomId) {
      navigate({ to: "/$roomId", params: { roomId } })
    }
  }

  const createRoom = async () => {
    try {
      setCreating(true)
      setCreateError(null)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/rooms`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to create room")
      const { roomId } = await res.json()

      // redirect to room
      navigate({ to: "/$roomId", params: { roomId } })
    } catch (err) {
      console.error("Error creating room", err)
      setCreateError("Could not create room. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <section className="bg-radial from-base-100 via-primary/10 to-accent/20 pt-24 pb-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <GiPokerHand size="4.5rem" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-wide">
                Agile estimation for remote and in-person teams
              </p>
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                Free Planning Poker for Agile Teams
              </h1>
              <p className="max-w-2xl text-lg text-base-content/75 md:text-xl">
                Run real-time scrum poker sessions, estimate story points, and
                align your team during backlog refinement without accounts or
                installs.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-base-content/70 sm:grid-cols-3">
              <div className="border-l-4 border-primary pl-3">
                Private voting
              </div>
              <div className="border-l-4 border-secondary pl-3">
                Instant room links
              </div>
              <div className="border-l-4 border-accent pl-3">
                Story point history
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <div className="mb-6 space-y-2 text-center">
              <h2 className="text-2xl font-bold">Start estimating</h2>
              <p className="text-sm text-base-content/70">
                Create a new room or join an existing planning poker session.
              </p>
            </div>

            <FormProvider {...methods}>
              <form
                className="flex flex-col gap-3 sm:flex-row"
                onSubmit={methods.handleSubmit(onSubmit)}
              >
                <input
                  {...methods.register("roomId")}
                  aria-label="Room ID"
                  placeholder="Room ID"
                  className="input input-bordered min-w-0 flex-1"
                />
                <button type="submit" className="btn btn-secondary">
                  Join Room
                </button>
              </form>
            </FormProvider>

            {createError && (
              <div className="alert alert-error mt-4" role="alert">
                <span>{createError}</span>
              </div>
            )}

            <div className="divider">or</div>

            <button
              disabled={creating}
              className="btn btn-primary w-full"
              type="button"
              onClick={createRoom}
            >
              {creating ? (
                <span className="loading loading-infinity text-primary-content" />
              ) : (
                "Create a free room"
              )}
            </button>

            <p className="mt-4 text-center text-xs text-base-content/60">
              No signup required. Share the room link with your team.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-base-300 bg-base-200 py-12">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3 md:px-8">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg bg-base-100 p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-base-content/70">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Agile estimation
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Planning poker that keeps refinement moving
            </h2>
          </div>
          <div className="space-y-4 text-base leading-7 text-base-content/75">
            <p>
              Pointing Poker helps scrum teams estimate user stories together.
              Participants choose their estimate privately, the facilitator
              reveals all votes at once, and the team can discuss large gaps
              before moving to the next round.
            </p>
            <p>
              It works for sprint planning, backlog refinement, remote
              estimation meetings, and lightweight async preparation when a
              team needs a simple story point tool.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-base-200 py-14">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <h2 className="text-3xl font-bold">Planning poker FAQ</h2>
          <div className="mt-6 divide-y divide-base-300 rounded-lg bg-base-100">
            {faqs.map((faq) => (
              <article key={faq.question} className="p-5">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

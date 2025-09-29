import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$roomId')({
	component: RouteComponent,


})

function RouteComponent() {
	const { roomId } = Route.useParams();
	console.log(roomId);
	return <div>Room ID: {roomId}</div>
}

import { createFileRoute } from '@tanstack/react-router'
import { FormProvider, useForm } from 'react-hook-form'

export const Route = createFileRoute('/')({
	component: App,
})

function App() {
	const methods = useForm()
	return (
		<div className="flex text-base-content min-h-[80vh] flex-col items-center justify-center text-center">

			<FormProvider {...methods}>
				<form className="flex items-center gap-2" onSubmit={methods.handleSubmit((data) => console.log(data))}>
					<input placeholder="Enter Room ID" className="input">

					</input>
					<button type="submit" className="btn btn-secondary">
						Submit
					</button>
				</form>
			</FormProvider>
			<div className="my-4">
				Or
			</div>
			<button className="btn btn-primary" type="button">
				Create a room
			</button>
		</div>
	)
}

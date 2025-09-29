import { ThemeSwitcher } from '@/utils/ThemeSwitcher'
import { Link } from '@tanstack/react-router'

export default function Header() {
	return (
		<header className="p-2 flex gap-2 bg-base-100 text-base-content justify-between">
			<nav className="flex flex-row">
				<div className="flex items-center font-bold">
					<Link to="/">Pointing Poker</Link>
				</div>
			</nav>
			<ThemeSwitcher />
		</header>
	)
}

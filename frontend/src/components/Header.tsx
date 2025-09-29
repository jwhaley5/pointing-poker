import { ThemeSwitcher } from '@/utils/ThemeSwitcher'
import { Link } from '@tanstack/react-router'
import { GiPokerHand } from 'react-icons/gi'

export default function Header() {
	return (
		<header className="fixed w-full p-2 flex gap-2 bg-base-100 border-b border-accent text-base-content justify-between">
			<nav className="flex flex-row">
				<div className="flex items-center font-bold">

					<Link to="/" className="flex items-center gap-2 text-primary text-2xl hover:opacity-80">

						<GiPokerHand size="2rem" />
						Pointing Poker</Link>
				</div>
			</nav>
			<ThemeSwitcher />
		</header>
	)
}

import { Link } from '@tanstack/react-router'
import { GiPokerHand } from 'react-icons/gi'
import { ThemeSwitcher } from '@/utils/ThemeSwitcher'

export default function Header() {
  return (
    <header className="navbar z-50 absolute w-full p-2 flex gap-2 bg-base-100 border-b border-accent text-base-content justify-between">
      <Link
        to="/"
        className="flex items-center gap-2 text-primary font-bold text-2xl hover:opacity-80"
      >
        <GiPokerHand size="2rem" />
        Pointing Poker
      </Link>
      <ThemeSwitcher />
    </header>
  )
}

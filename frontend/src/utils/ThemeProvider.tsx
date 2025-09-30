import { useEffect, useState } from 'react'
import { ThemeContext } from './ThemeContext'
import type { PropsWithChildren } from 'react'
import type { Theme } from './types'

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>('corporate')

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') ?? 'corporate'
    setTheme(storedTheme as Theme)
    document.documentElement.setAttribute('data-theme', storedTheme)
  }, [])

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

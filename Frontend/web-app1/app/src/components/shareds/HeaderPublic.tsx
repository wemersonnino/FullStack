'use client'

import ThemeToggle from './ThemeToggle'

export default function HeaderPublic() {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold">Plataforma Fundep</h1>
      <ThemeToggle />
    </header>
  )
}
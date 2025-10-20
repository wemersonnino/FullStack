'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const current = theme === 'system' ? resolvedTheme : theme
  const toggle = () => setTheme(current === 'dark' ? 'light' : 'dark')

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="p-2 rounded-full border border-gray-300 dark:border-gray-600"
    >
      {current === 'dark' ? '🌙' : '🌞'}
    </button>
  )
}

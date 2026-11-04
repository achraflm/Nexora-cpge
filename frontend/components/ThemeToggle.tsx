'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from '@phosphor-icons/react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved =
      window.localStorage.getItem('nexora-theme') ||
      window.localStorage.getItem('learning-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('light', !isDark)

    const handleThemeChange = (e: CustomEvent<{ isDark: boolean }>) => {
      setDark(e.detail.isDark)
    }
    window.addEventListener('nexora-theme-change' as any, handleThemeChange)
    return () => {
      window.removeEventListener('nexora-theme-change' as any, handleThemeChange)
    }
  }, [])

  function toggleTheme() {
    const nextDark = !dark
    setDark(nextDark)
    window.localStorage.setItem('nexora-theme', nextDark ? 'dark' : 'light')
    window.localStorage.setItem('learning-theme', nextDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', nextDark)
    document.documentElement.classList.toggle('light', !nextDark)

    window.dispatchEvent(
      new CustomEvent('nexora-theme-change', { detail: { isDark: nextDark } })
    )
  }

  if (!mounted) {
    return (
      <div className={`size-9 rounded-lg ${className}`} aria-hidden="true" />
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex size-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-200/60 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3978F6] dark:text-[#c4d0e4] dark:hover:bg-white/10 dark:hover:text-white ${className}`}
      aria-label={dark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {dark ? <Sun size={19} weight="bold" /> : <Moon size={19} weight="bold" />}
    </button>
  )
}

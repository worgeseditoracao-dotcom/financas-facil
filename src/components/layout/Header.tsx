'use client'

import { LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useStore } from '@/lib/store'

export default function Header() {
  const { user, logout } = useAuth()
  const { state, setTheme } = useStore()

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <span className="text-lg font-bold text-emerald-500">Finanças</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {user && (
          <div className="hidden sm:flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{user.name}</span>
          </div>
        )}
        <button
          onClick={() => setTheme(state.theme === 'light' ? 'dark' : 'light')}
          className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {user && (
          <button
            onClick={logout}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  )
}

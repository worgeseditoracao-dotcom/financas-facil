'use client'

import { Bell, LogOut } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <span className="text-lg font-bold text-emerald-500">Finanças</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-zinc-50">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black text-xs font-medium">
            U
          </div>
          <span className="text-sm text-zinc-500">Usuário</span>
        </div>
        <button className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100">
          <Bell size={18} />
        </button>
        <button className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
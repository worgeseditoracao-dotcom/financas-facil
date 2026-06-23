'use client'

import { useState } from 'react'
import { LogOut, Sun, Moon, Menu, X, LayoutDashboard, User, Briefcase, Tags, BarChart3, Settings, Target, Users, FileText, Lightbulb, TrendingUp, CreditCard, Building2, DollarSign, Truck, RefreshCw, Shield, MessageSquare, CalendarRange } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useStore } from '@/lib/store'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pessoal', label: 'Pessoal', icon: User },
  { href: '/negocio', label: 'Negócio', icon: Briefcase },
  { href: '/empresas', label: 'Empresas', icon: Building2 },
  { href: '/insights-tips', label: 'Insights', icon: Lightbulb },
  { href: '/investimentos', label: 'Investimentos', icon: TrendingUp },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/planejamento', label: 'Planejamento', icon: CalendarRange },
  { href: '/contas', label: 'Contas a Pagar', icon: CreditCard },
  { href: '/receber', label: 'Contas a Receber', icon: DollarSign },
  { href: '/categorias', label: 'Categorias', icon: Tags },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

const adminLinks = [
  { href: '/admin', label: 'Painel Admin', icon: Shield },
  { href: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare },
]

export default function Header() {
  const { user, logout } = useAuth()
  const { state, setTheme } = useStore()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = user?.role === 'admin'

  const allLinks = isAdmin ? [...links, ...adminLinks] : links

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Menu size={20} />
          </button>
          <span className="text-lg font-bold text-emerald-500">Finanças</span>
        </div>
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

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-900 shadow-2xl overflow-y-auto">
            <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-lg font-bold text-emerald-500">Finanças</span>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={20} />
              </button>
            </div>

            {/* User info */}
            {user && (
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                    {isAdmin && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Admin</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="py-3 space-y-0.5 px-2">
              {allLinks.map(link => {
                const Icon = link.icon
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}>
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 space-y-1">
              <button onClick={() => { setTheme(state.theme === 'light' ? 'dark' : 'light') }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                <span>{state.theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}</span>
              </button>
              {user && (
                <button onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={20} />
                  <span>Sair</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

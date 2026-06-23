'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, User, Briefcase, Tags, BarChart3, Settings,
  Target, Users, FileText, Lightbulb, CalendarRange,
  TrendingUp, CreditCard, Building2, ChevronLeft, ChevronRight,
  DollarSign, Truck, RefreshCw, Shield, MessageSquare
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pessoal', label: 'Pessoal', icon: User },
  { href: '/negocio', label: 'Negócio', icon: Briefcase },
  { href: '/investimentos', label: 'Investimentos', icon: TrendingUp },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/planejamento', label: 'Planejamento', icon: CalendarRange },
  { href: '/contas-bancarias', label: 'Bancos', icon: Building2 },
  { href: '/conciliacao', label: 'Conciliação', icon: RefreshCw },
  { href: '/contas', label: 'Contas a Pagar', icon: CreditCard },
  { href: '/receber', label: 'Contas a Receber', icon: DollarSign },
  { href: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { href: '/clientes', label: 'Empresa', icon: Users },
  { href: '/categorias', label: 'Categorias', icon: Tags },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/empresas', label: 'Empresas', icon: Building2 },
  { href: '/insights-tips', label: 'Insights', icon: Lightbulb },
  { href: '/configuracoes', label: 'Config', icon: Settings },
]

const adminLinks = [
  { href: '/admin', label: 'Painel Admin', icon: Shield },
  { href: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare },
]

const userLinks = [
  { href: '/configuracoes', label: 'Suporte / Fale Conosco', icon: MessageSquare },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (isAdmin) {
      const check = () => {
        fetch('/api/admin/stats/messages').then(r => r.json()).then(d => setUnread(d.unread || 0))
      }
      check()
      const interval = setInterval(check, 30000)
      return () => clearInterval(interval)
    }
  }, [isAdmin])

  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <span className="text-lg font-bold text-emerald-500">{isAdmin ? 'Admin' : 'Finanças'}</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 py-3 space-y-1 px-2 overflow-y-auto">
        {links.map(link => {
          const Icon = link.icon
          const active = pathname === link.href
          return (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}>
              <Icon size={20} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}

        {/* Admin links */}
        {isAdmin && adminLinks.map(link => {
          const Icon = link.icon
          const active = pathname === link.href || pathname.startsWith(link.href + '/')
          return (
            <Link key={link.href} href={link.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors relative ${
                active ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}>
              <Icon size={20} />
              {!collapsed && <span>{link.label}</span>}
              {link.href === '/admin/mensagens' && unread > 0 && (
                <span className={`absolute ${collapsed ? '-top-1 -right-1' : 'right-2'} flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white`}>
                  {unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

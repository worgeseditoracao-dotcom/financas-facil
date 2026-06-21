'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, User, Briefcase, Tags, BarChart3, Settings,
  Target, Users, FileText, Lightbulb, CalendarRange,
  TrendingUp, CreditCard, Building2, ChevronLeft, ChevronRight,
  DollarSign, Truck, RefreshCw
} from 'lucide-react'
import { useState } from 'react'

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
  { href: '/configuracoes', label: 'Config', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`hidden md:flex flex-col bg-white border-r border-zinc-200 transition-all duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex h-14 items-center justify-between px-4 border-b border-zinc-200">
        {!collapsed && (
          <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>Finanças</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100">
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
                active
                  ? 'text-white'
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
              style={active ? { backgroundColor: 'var(--accent)', color: '#fff' } : {}}
            >
              <Icon size={20} />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

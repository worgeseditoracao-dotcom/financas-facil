'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, MessageSquare, BarChart3, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useEffect } from 'react'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
  { href: '/admin/mensagens', label: 'Mensagens', icon: MessageSquare },
  { href: '/admin/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/')
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500" /></div>
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800">
        <div className="flex h-14 items-center px-4 border-b border-zinc-800">
          <span className="text-lg font-bold text-emerald-400">Admin</span>
        </div>
        <nav className="flex-1 py-3 space-y-1 px-2">
          {adminLinks.map(link => {
            const Icon = link.icon
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}>
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-zinc-800">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200">
            <ArrowLeft size={20} />
            <span>Voltar ao App</span>
          </Link>
        </div>
      </aside>
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden bg-zinc-50">
        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-zinc-200 bg-white overflow-x-auto">
          {adminLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href}
                className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium ${active ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                {link.label}
              </Link>
            )
          })}
          <Link href="/" className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-600 ml-auto">
            ← App
          </Link>
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </>
  )
}

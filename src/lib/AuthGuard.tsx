'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth, PUBLIC_ROUTES } from './AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import FloatingButton from '@/components/layout/FloatingButton'
import { type ReactNode } from 'react'

function Shell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api')
  const isAdmin = pathname.startsWith('/admin')

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500" />
      </div>
    )
  }

  if (isPublic) {
    return <>{children}</>
  }

  // Admin routes: não renderiza sidebar/header normais (admin layout cuida disso)
  if (isAdmin) {
    if (!user || user.role !== 'admin') {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
          <p className="text-zinc-500">Acesso restrito a administradores</p>
        </div>
      )
    }
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <FloatingButton />
    </>
  )
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Shell>{children}</Shell>
    </AuthProvider>
  )
}

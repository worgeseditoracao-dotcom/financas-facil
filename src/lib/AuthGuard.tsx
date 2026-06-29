'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider, useAuth, PUBLIC_ROUTES } from './AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import FloatingButton from '@/components/layout/FloatingButton'
import { type ReactNode, useEffect, useRef } from 'react'

function CloudSync() {
  const { user } = useAuth()
  const lastSync = useRef('')
  const syncedOnce = useRef(false)

  useEffect(() => {
    if (!user?.id) return
    fetch('/api/sync-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'load', userId: user.id }),
    }).then(r => r.json()).then(cloud => {
      if (!cloud?.store) return
      const local = localStorage.getItem('financas-facil-data')
      const localData = local ? JSON.parse(local) : {}

      const cloudCount = countItems(cloud.store)
      const localCount = countItems(localData)

      // Cloud tem mais dados = carrega da nuvem
      if (cloudCount > localCount) {
        localStorage.setItem('financas-facil-data', JSON.stringify(cloud.store))
        window.location.reload()
      }
      // Local tem mais = sobe pra nuvem
      if (localCount > cloudCount) {
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', userId: user.id, store: localData }),
        })
      }
    })
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    const interval = setInterval(() => {
      const current = localStorage.getItem('financas-facil-data')
      if (current && current !== lastSync.current) {
        lastSync.current = current
        fetch('/api/sync-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', userId: user.id, store: JSON.parse(current) }),
        }).then(() => { syncedOnce.current = true })
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [user?.id])

  return null
}

function countItems(store: any): number {
  if (!store) return 0
  let count = 0
  const keys = ['transactions', 'goals', 'bills', 'receivables', 'bankAccounts', 'creditCards', 'budgets', 'investments', 'clients', 'suppliers', 'subscriptions', 'businessProducts', 'statementEntries']
  for (const k of keys) {
    if (Array.isArray(store[k])) count += store[k].length
  }
  return count
}

function Shell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/api')
  const isAdmin = pathname.startsWith('/admin')

  if (loading) {
    if (isPublic) return <>{children}</>
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500" />
      </div>
    )
  }

  if (isPublic) {
    return <>{children}</>
  }

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
      <CloudSync />
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
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

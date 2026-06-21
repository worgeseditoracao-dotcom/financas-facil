'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  access_status: string
  access_type?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const PUBLIC_ROUTES = ['/vendas', '/login', '/primeiro-acesso', '/acesso-bloqueado']

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          if (data.user.access_status === 'blocked') {
            setUser(null)
            setLoading(false)
            router.replace('/acesso-bloqueado')
            return
          }
          if (data.user.access_status !== 'active') {
            setUser(null)
            setLoading(false)
            router.replace('/vendas')
            return
          }
          setUser(data.user)
          setLoading(false)
          return
        }
      }
    } catch {}
    setUser(null)
    setLoading(false)
  }, [router])

  useEffect(() => { checkAuth() }, [checkAuth])

  useEffect(() => {
    if (loading) return
    const isPublic = PUBLIC_ROUTES.includes(pathname)
    if (!user && !isPublic) {
      router.replace('/vendas')
    }
  }, [user, loading, pathname, router])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: data.error || 'Email ou senha inválidos' }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.replace('/vendas')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

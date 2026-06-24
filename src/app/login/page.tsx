'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { APP_NAME } from '@/lib/config'

export default function LoginPage() {
  const router = useRouter()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { if (user) router.replace('/') }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (!result.success) {
      setError(result.error || 'Erro ao fazer login')
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-zinc-900">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-zinc-500">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Sua senha" required />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-600 transition-colors disabled:opacity-50">
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              <a href="/resetar-senha" className="font-medium text-emerald-500 hover:text-emerald-600">Esqueci minha senha</a>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Ainda não tem acesso?{' '}
              <a href="/vendas" className="font-medium text-emerald-500 hover:text-emerald-600">Comprar acesso</a>
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Já comprou e não criou senha?{' '}
              <a href="/primeiro-acesso" className="font-medium text-emerald-500 hover:text-emerald-600">Primeiro acesso</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

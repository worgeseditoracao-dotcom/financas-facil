'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    if (password !== confirm) {
      setError('As senhas não conferem')
      return
    }

    if (password.length < 4) {
      setError('Senha deve ter no mínimo 4 caracteres')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erro ao redefinir senha')
      }
    } catch {
      setError('Erro de conexão')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl border border-emerald-200 bg-white dark:bg-zinc-900 p-8 shadow-sm">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Senha redefinida!</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Sua nova senha foi salva. Agora é só fazer login.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors">
              Ir para o Login <ArrowRight size={14} className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 p-8 shadow-sm">
          <div className="mb-6 text-center">
            <Shield size={32} className="mx-auto mb-2 text-emerald-500" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Redefinir Senha</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Digite seu email e crie uma nova senha
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nova Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Mínimo 4 caracteres"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirmar Senha</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Repita a senha"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-50">
              {submitting ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
              ← Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { APP_NAME } from '@/lib/config'

type Step = 'email' | 'password' | 'done'

export default function PrimeiroAcessoPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!data.exists) {
        setError(data.message || 'Email não encontrado')
        setSubmitting(false)
        return
      }
      if (data.hasPassword) {
        setError('Você já criou uma senha. Faça login.')
        setSubmitting(false)
        return
      }
      setStep('password')
    } catch {
      setError('Erro de conexão')
    }
    setSubmitting(false)
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 4) { setError('Mínimo 4 caracteres'); return }
    if (password !== confirmPassword) { setError('Senhas não conferem'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Erro ao criar senha'); setSubmitting(false); return }
      setStep('done')
    } catch {
      setError('Erro de conexão')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {step === 'email' && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-zinc-900">{APP_NAME}</h1>
                <p className="mt-1 text-sm text-zinc-500">Primeiro acesso — verifique seu email</p>
              </div>
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Email usado na compra
                  </label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="seu@email.com" required />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  {submitting ? 'Verificando...' : 'Verificar Email'}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-zinc-500">
                Já tem senha? <a href="/login" className="text-emerald-500 hover:text-emerald-600 font-medium">Faça login</a>
              </p>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-bold text-zinc-900">Crie sua senha</h1>
                <p className="mt-1 text-sm text-zinc-500">{email}</p>
              </div>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Mínimo 4 caracteres" required minLength={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">Confirmar senha</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Repita a senha" required minLength={4} />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-600 transition-colors disabled:opacity-50">
                  {submitting ? 'Criando...' : 'Criar Senha'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-zinc-900">Senha criada com sucesso!</h1>
              <p className="mt-2 text-sm text-zinc-500">Agora você pode fazer login no sistema.</p>
              <button onClick={() => router.push('/login')}
                className="mt-6 w-full rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-600 transition-colors">
                Ir para o Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

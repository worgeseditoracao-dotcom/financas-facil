'use client'

import { ShieldAlert } from 'lucide-react'
import { APP_NAME, CAKTO_CHECKOUT_URL } from '@/lib/config'

export default function AcessoBloqueadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <ShieldAlert size={28} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Acesso Bloqueado</h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            Seu acesso ao {APP_NAME} ainda não está ativo ou foi bloqueado.
            <br />
            Entre em contato com o suporte para regularizar sua situação.
          </p>

          <div className="mt-6 space-y-3">
            <a href={CAKTO_CHECKOUT_URL} target="_blank" rel="noopener noreferrer"
              className="block w-full rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-emerald-600 transition-colors">
              Comprar Acesso
            </a>
            <a href="/vendas"
              className="block w-full rounded-2xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
              Voltar para Página Inicial
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

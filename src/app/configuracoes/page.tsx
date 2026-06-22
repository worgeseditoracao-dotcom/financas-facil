'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Download, Trash2, Palette, ShieldOff, MessageSquare, Send } from 'lucide-react'
import { exportToExcel, exportToPDF, exportToCSV } from '@/lib/export'
import { ACCENT_COLORS } from '@/lib/constants'

function CancelAccount() {
  const [orderId, setOrderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ ok?: boolean; message?: string; error?: string } | null>(null)

  const handleRefund = async () => {
    if (!orderId.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch('/api/user/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim() }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ error: 'Erro de conexão' })
    }
    setSubmitting(false)
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-zinc-500">Informe o ID do seu pedido Cakto (encontrado no e-mail de confirmação) para solicitar o reembolso dentro do prazo de 7 dias.</p>
      <div className="flex gap-2">
        <Input
          placeholder="ID do pedido (ex: 10bb51bb-...)"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          className="flex-1"
        />
        <Button variant="danger" onClick={handleRefund} disabled={submitting || !orderId.trim()}>
          {submitting ? 'Solicitando...' : 'Solicitar Reembolso'}
        </Button>
      </div>
      {result && (
        <div className={`text-sm p-3 rounded-xl ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
          {result.message || result.error}
          {result.ok && <p className="mt-1 text-xs text-emerald-500">Seu acesso será bloqueado após a Cakto processar o reembolso.</p>}
        </div>
      )}
    </div>
  )
}

function SupportMessages() {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    setMessage('')
    setSent(true)
    setSending(false)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Escreva sua mensagem aqui..."
        className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm h-24 resize-none focus:border-emerald-500 focus:outline-none"
      />
      <button onClick={handleSend} disabled={sending || !message.trim()}
        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50">
        <Send size={14} /> {sending ? 'Enviando...' : sent ? 'Enviado!' : 'Enviar Mensagem'}
      </button>
      {sent && <p className="text-sm text-emerald-600">Mensagem enviada! O admin responderá em breve.</p>}
    </div>
  )
}

export default function Settings() {
  const { state, deleteTransaction, updateSettings } = useStore()
  const { user } = useAuth()

  const handleExportAll = () => exportToExcel(state.transactions, 'financas-facil-completo')
  const handleExportPDF = () => exportToPDF(state.transactions, 'financas-facil-completo')
  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      for (const t of state.transactions) deleteTransaction(t.id)
    }
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Personalize sua experiência</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Perfil</h2>
        <Input label="Seu Nome" placeholder="Seu nome" value={state.settings.name} onChange={e => updateSettings({ name: e.target.value })} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Aparência</h2>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map(color => (
            <button key={color} onClick={() => updateSettings({ accentColor: color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${state.settings.accentColor === color ? 'border-zinc-900 dark:border-zinc-100 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Exportar Dados</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Exporte suas transações para Excel, PDF ou CSV</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportAll}><Download size={16} /> Excel</Button>
          <Button variant="secondary" onClick={handleExportPDF}><Download size={16} /> PDF</Button>
          <Button variant="secondary" onClick={() => exportToCSV(state.transactions)}><Download size={16} /> CSV</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50"><MessageSquare size={18} className="inline mr-1" /> Suporte / Fale Conosco</h2>
        <SupportMessages />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50"><ShieldOff size={18} className="inline mr-1" /> Cancelar Conta</h2>
        <CancelAccount />
      </div>

      <div className="rounded-2xl border border-red-200 bg-white p-5 dark:border-red-900/30 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-red-600 dark:text-red-400">Zona de Perigo</h2>
        <p className="mt-1 text-sm text-zinc-500">Ações irreversíveis</p>
        <div className="mt-4">
          <Button variant="danger" onClick={handleClearData}><Trash2 size={16} /> Limpar Todos os Dados</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Sobre</h2>
        <div className="mt-3 space-y-1 text-sm text-zinc-500">
          <p>Finanças Fácil v2.0.0</p>
          <p>Sistema de gestão financeira completo</p>
          <p>Pessoal e Empresarial</p>
        </div>
      </div>
    </div>
  )
}

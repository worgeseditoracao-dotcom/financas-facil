'use client'

import { useState, useEffect } from 'react'
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
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Dentro do prazo de 7 dias após a compra, você pode solicitar o reembolso total. Informe o ID do pedido (encontrado no e-mail de confirmação da Cakto).
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="ID do pedido Cakto"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          className="flex-1"
        />
        <Button variant="danger" onClick={handleRefund} disabled={submitting || !orderId.trim()}>
          {submitting ? 'Solicitando...' : 'Reembolsar'}
        </Button>
      </div>
      {result && (
        <div className={`text-sm p-3 rounded-xl ${result.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
          {result.message || result.error}
          {result.ok && <p className="mt-1 text-xs opacity-70">Seu acesso será bloqueado após a Cakto processar o reembolso.</p>}
        </div>
      )}
    </div>
  )
}

function SupportMessages() {
  const [messages, setMessages] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [hasReply, setHasReply] = useState(false)

  const loadMessages = async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    const msgs = data.messages || []
    setMessages(msgs)
    setHasReply(msgs.some((m: any) => m.reply && !m.to_admin))
  }

  useEffect(() => { loadMessages() }, [])

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
    loadMessages()
  }

  if (!showChat) {
    return (
      <div className="mt-4">
        <button onClick={() => setShowChat(true)} className="relative rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
          💬 Falar com o Suporte
          {hasReply && (
            <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-pulse">
              !
            </span>
          )}
        </button>
        {hasReply && <p className="mt-1 text-xs text-emerald-600">Você tem uma nova resposta!</p>}
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
          ⏱️ Respondemos em até 48 horas úteis
        </p>
        <button onClick={() => setShowChat(false)} className="text-xs text-zinc-400 hover:text-zinc-600">
          Fechar
        </button>
      </div>

      {messages.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {messages.map(msg => (
            <div key={msg.id} className={`rounded-xl p-2.5 text-sm ${msg.to_admin ? 'bg-emerald-50 border border-emerald-100' : 'bg-purple-50 border border-purple-100'}`}>
              <p className="text-xs font-medium text-zinc-500 mb-0.5">{msg.to_admin ? 'Você' : 'Suporte'}</p>
              <p className="text-zinc-700 whitespace-pre-wrap">{msg.message}</p>
              {msg.reply && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <p className="text-xs font-medium text-purple-600 mb-0.5">Resposta:</p>
                  <p className="text-zinc-700 text-xs whitespace-pre-wrap">{msg.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Escreva sua mensagem..."
          className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50"
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
        />
        <button onClick={handleSend} disabled={sending || !message.trim()}
          className="rounded-xl bg-emerald-500 px-3 py-2 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
          {sending ? '...' : sent ? '✓' : 'Enviar'}
        </button>
      </div>
      {sent && <p className="text-xs text-emerald-600">Enviado! Responderemos em até 48h.</p>}
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

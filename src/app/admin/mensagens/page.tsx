'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { Send, Mail, MessageSquare } from 'lucide-react'

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const { user } = useAuth()

  const loadMessages = useCallback(async () => {
    const res = await fetch('/api/messages')
    const data = await res.json()
    setMessages(data.messages || [])
  }, [])

  useEffect(() => { loadMessages() }, [loadMessages])

  const handleReply = async (messageId: string) => {
    if (!reply.trim()) return
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply, replyToId: messageId }),
    })
    setReply('')
    setReplyingId(null)
    loadMessages()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Mensagens</h1>
        <p className="mt-1 text-sm text-zinc-500">{messages.length} mensagens — {messages.filter(m => !m.read && m.to_admin).length} não lidas</p>
      </div>

      <div className="space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`rounded-2xl border p-4 ${!msg.read && msg.to_admin ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium">
                  {msg.from_email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{msg.from_email}</p>
                  <p className="text-xs text-zinc-400">{new Date(msg.created_at).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${msg.to_admin ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {msg.to_admin ? 'Usuário → Admin' : 'Admin → Usuário'}
              </span>
            </div>

            <p className="text-sm text-zinc-700 whitespace-pre-wrap pl-10">{msg.message}</p>

            {msg.reply && (
              <div className="mt-3 pl-10 pt-3 border-t border-zinc-100">
                <p className="text-xs font-medium text-emerald-600 mb-1">Resposta do admin:</p>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{msg.reply}</p>
              </div>
            )}

            {msg.to_admin && !msg.reply && (
              <div className="mt-3 pl-10">
                {replyingId === msg.id ? (
                  <div className="flex gap-2">
                    <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Escreva a resposta..." className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm" autoFocus />
                    <button onClick={() => handleReply(msg.id)} className="rounded-xl bg-emerald-500 px-3 py-2 text-white text-sm font-medium">Enviar</button>
                    <button onClick={() => { setReplyingId(null); setReply('') }} className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-600">Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setReplyingId(msg.id)} className="text-sm font-medium text-emerald-500 hover:text-emerald-600">
                    Responder
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 text-zinc-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma mensagem ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}

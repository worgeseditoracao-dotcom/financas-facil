'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, Shield, ShieldOff, UserPlus, Undo2 } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')

  const loadUsers = () => fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []))

  useEffect(() => { loadUsers() }, [])

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (email: string, updates: any) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, updates }),
    })
    loadUsers()
  }

  const handleRefund = async (email: string) => {
    if (!confirm(`Reembolsar e bloquear ${email}?`)) return
    await fetch('/api/admin/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    loadUsers()
  }

  const handleDelete = async (email: string) => {
    if (!confirm(`Excluir usuário ${email}?`)) return
    await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, { method: 'DELETE' })
    loadUsers()
  }

  const handleAdd = async () => {
    if (!newEmail) return
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, name: newName || newEmail }),
    })
    setNewEmail('')
    setNewName('')
    setShowAdd(false)
    loadUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Usuários</h1>
          <p className="mt-1 text-sm text-zinc-500">{users.length} usuários cadastrados</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
          <UserPlus size={16} /> Adicionar
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome" className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email" className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <button onClick={handleAdd} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white">Criar</button>
          <button onClick={() => setShowAdd(false)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-600">Cancelar</button>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário..." className="h-10 w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm" />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Função</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Criado em</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">{u.name}</td>
                <td className="px-4 py-3 text-zinc-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.access_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    u.access_status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'
                  }`}>{u.access_status}</span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{u.role}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{u.created_at?.substring(0, 10)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {u.access_status === 'active' ? (
                      <>
                        <button onClick={() => handleRefund(u.email)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-amber-50 hover:text-amber-500" title="Reembolsar">
                          <Undo2 size={14} />
                        </button>
                        <button onClick={() => handleAction(u.email, { access_status: 'blocked', blocked_reason: 'admin' })} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500" title="Bloquear">
                          <ShieldOff size={14} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleAction(u.email, { access_status: 'active', blocked_reason: null })} className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500" title="Ativar">
                        <Shield size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(u.email)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500" title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

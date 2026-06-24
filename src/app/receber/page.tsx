'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, AlertTriangle, Clock, FileText, DollarSign, ArrowUpRight, Repeat, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Receivable } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Receber() {
  const { state, addReceivable, updateReceivable, deleteReceivable } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Receivable | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'received' | 'overdue'>('all')
  const [modFilter, setModFilter] = useState<'all' | 'personal' | 'business'>('all')

  const { receivables, clients } = state
  const today = new Date().toISOString().split('T')[0]

  const clientMap = useMemo(() => {
    const m: Record<string, string> = {}
    clients.forEach(c => { m[c.id] = c.name })
    return m
  }, [clients])

  const stats = useMemo(() => {
    const f = modFilter === 'all' ? receivables : receivables.filter(r => r.module === modFilter)
    const all = f.reduce((a, r) => a + r.value, 0)
    const received = f.filter(r => r.received).reduce((a, r) => a + r.value, 0)
    const pending = f.filter(r => !r.received && r.dueDate >= today).reduce((a, r) => a + r.value, 0)
    const overdue = f.filter(r => !r.received && r.dueDate < today).reduce((a, r) => a + r.value, 0)
    return { all, received, pending, overdue }
  }, [receivables, today, modFilter])

  const filtered = useMemo(() => {
    let f = modFilter === 'all' ? receivables : receivables.filter(r => r.module === modFilter)
    switch (filter) {
      case 'received': return f.filter(r => r.received)
      case 'pending': return f.filter(r => !r.received && r.dueDate >= today)
      case 'overdue': return f.filter(r => !r.received && r.dueDate < today)
      default: return f
    }
  }, [receivables, filter, today, modFilter])

  const handleToggleReceived = (r: Receivable) => {
    updateReceivable({ ...r, received: !r.received, receivedDate: !r.received ? today : undefined })
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Contas a Receber</h1>
          <p className="mt-1 text-sm text-zinc-500">Controle tudo que você tem para receber</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Novo Recebimento</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'personal', 'business'] as const).map(m => (
          <button key={m} onClick={() => setModFilter(m)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${modFilter === m ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>
            {m === 'all' ? 'Todas' : m === 'personal' ? 'Pessoal' : 'PJ'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Total a Receber</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCurrency(stats.all)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Recebido</span>
          <p className="mt-1 text-lg font-bold text-emerald-500">{formatCurrency(stats.received)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">A Vencer</span>
          <p className="mt-1 text-lg font-bold text-blue-500">{formatCurrency(stats.pending)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Atrasado</span>
          <p className="mt-1 text-lg font-bold text-red-500">{formatCurrency(stats.overdue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'overdue', 'received'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100'}`}>
            {f === 'all' ? 'Todas' : f === 'received' ? 'Recebidas' : f === 'pending' ? 'A Vencer' : 'Atrasadas'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(r => {
          const isOverdue = !r.received && r.dueDate < today
          const isDueSoon = !r.received && r.dueDate >= today && r.dueDate <= new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
          const clientName = r.clientId ? clientMap[r.clientId] : null
          return (
            <div key={r.id} className={`rounded-2xl border p-4 flex items-center gap-4 group ${isOverdue ? 'border-red-500/30 bg-red-500/5' : isDueSoon ? 'border-yellow-500/30 bg-yellow-500/5' : r.received ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-200 bg-white'}`}>
              <button onClick={() => handleToggleReceived(r)}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${r.received ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500 hover:bg-emerald-500/20'}`}>
                <CheckCircle2 size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={14} className="text-emerald-500" />
                  <p className={`font-medium ${r.received ? 'line-through opacity-50 text-zinc-500' : 'text-zinc-900'}`}>{r.name}</p>
                  {isOverdue && <AlertTriangle size={14} className="text-red-500" />}
                  {isDueSoon && <Clock size={14} className="text-yellow-500" />}
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-medium ${r.module === 'personal' ? 'text-blue-500 bg-blue-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                    {r.module === 'personal' ? 'Pessoal' : 'PJ'}
                  </span>
                  {clientName && (
                    <span className="text-[10px] text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">{clientName}</span>
                  )}
                  {r.recurring && <Repeat size={12} className="text-zinc-400" />}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {r.category} · Vence {formatDate(r.dueDate)}
                  {r.installment && ` · Parcela ${r.installment.current}/${r.installment.total}`}
                  {r.recurring && ' · Recorrente'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold ${r.received ? 'text-emerald-500' : 'text-zinc-900'}`}>
                  {formatCurrency(r.value)}
                </p>
                {r.received && r.receivedDate && (
                  <p className="text-[10px] text-emerald-500">Recebido em {formatDate(r.receivedDate)}</p>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(r)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
                <button onClick={() => deleteReceivable(r.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <DollarSign size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum recebimento encontrado</p>
            <p className="text-sm mt-1">Adicione contas a receber, faturas ou parcelamentos</p>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <ReceivableForm
          receivable={editing}
          clients={clients}
          onSave={(data) => { editing ? (updateReceivable({ ...editing, ...data }), setEditing(null)) : (addReceivable(data), setShowForm(false)) }}
          onClose={() => { setShowForm(false); setEditing(null) }} />
      )}
    </div>
  )
}

function ReceivableForm({ receivable, clients, onSave, onClose }: {
  receivable?: Receivable | null
  clients: { id: string; name: string }[]
  onSave: (data: Omit<Receivable, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const { state } = useStore()
  const [name, setName] = useState(receivable?.name || '')
  const [value, setValue] = useState(receivable ? String(receivable.value) : '')
  const [dueDate, setDueDate] = useState(receivable?.dueDate || '')
  const [category, setCategory] = useState(receivable?.category || 'Serviços')
  const [type, setType] = useState<'receivable' | 'installment' | 'invoice'>(receivable?.type || 'receivable')
  const [recurring, setRecurring] = useState(receivable?.recurring || false)
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>(receivable?.frequency || 'monthly')
  const [accountId, setAccountId] = useState(receivable?.accountId || '')
  const [module, setModule] = useState<'personal' | 'business'>(receivable?.module || 'business')
  const [clientId, setClientId] = useState(receivable?.clientId || '')
  const [totalInstallments, setTotalInstallments] = useState(receivable?.installment?.total ? String(receivable.installment.total) : '')
  const [currentInstallment, setCurrentInstallment] = useState(receivable?.installment?.current ? String(receivable.installment.current) : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !value || !dueDate) return
    onSave({
      name: name.trim(), value: Math.abs(parseFloat(value)), dueDate, category,
      received: false, recurring, frequency: recurring ? frequency : undefined, accountId: accountId || undefined, type,
      clientId: clientId || undefined,
      module,
      installment: type === 'installment' && totalInstallments ? { total: parseInt(totalInstallments), current: parseInt(currentInstallment) || 1 } : undefined,
    })
  }

  return (
    <Modal title={receivable ? 'Editar Recebimento' : 'Novo Recebimento'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" placeholder="Ex: Consultoria" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Tipo</label>
          <div className="flex flex-wrap gap-2">
            {[{ value: 'receivable', label: 'Recebimento' }, { value: 'installment', label: 'Parcelamento' }, { value: 'invoice', label: 'Fatura' }].map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value as typeof type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${type === t.value ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input label="Valor (R$)" type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} required />
          <Input label="Vencimento" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
            {['Serviços', 'Vendas', 'Freelance', 'Salário', 'Aluguel', 'Investimentos', 'Consultoria', 'Produtos', 'Outros'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {clients.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Cliente (opcional)</label>
            <select value={clientId} onChange={e => setClientId(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
              <option value="">Sem cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        {type === 'installment' && (
          <div className="flex gap-2">
            <Input label="Total Parcelas" type="number" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
            <Input label="Parcela Atual" type="number" value={currentInstallment} onChange={e => setCurrentInstallment(e.target.value)} />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer">
          <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="h-4 w-4 rounded border-zinc-200 text-emerald-500" />
          Recorrente
        </label>
        {recurring && (
          <div className="flex gap-2">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-zinc-500">Frequência</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as any)}
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>
        )}
        {state.bankAccounts.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Conta Bancária (opcional)</label>
            <select value={accountId} onChange={e => setAccountId(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
              <option value="">Sem conta</option>
              {state.bankAccounts.map(a => <option key={a.id} value={a.id}>{a.bank} - {a.name}</option>)}
            </select>
          </div>
        )}
        {type === 'invoice' && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-600">📄 Fatura: ao salvar, será possível gerar o PDF da fatura com os dados do cliente.</p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{receivable ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

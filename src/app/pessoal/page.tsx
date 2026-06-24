'use client'

import { useState, useMemo } from 'react'
import { Plus, ArrowUpRight, ArrowDownRight, PiggyBank, Film, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { filterTransactionsByModule, filterTransactionsByPeriod, calculateIncome, calculateExpenses, formatCurrency } from '@/lib/utils'
import type { FilterPeriod, Subscription } from '@/lib/types'
import TransactionTable from '@/components/finance/TransactionTable'
import TransactionForm from '@/components/finance/TransactionForm'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'

export default function PersonalFinance() {
  const { state, addTransaction, updateTransaction, deleteTransaction, addSubscription, updateSubscription, deleteSubscription } = useStore()
  const [period, setPeriod] = useState<FilterPeriod>('month')
  const [showForm, setShowForm] = useState(false)
  const [showSubForm, setShowSubForm] = useState(false)
  const [editSub, setEditSub] = useState<Subscription | null>(null)

  const personalTransactions = useMemo(
    () => filterTransactionsByModule(state.transactions, 'personal'),
    [state.transactions]
  )

  const filtered = useMemo(
    () => filterTransactionsByPeriod(personalTransactions, period),
    [personalTransactions, period]
  )

  const income = calculateIncome(filtered)
  const expenses = calculateExpenses(filtered)
  const balance = income - expenses

  const activeSubs = state.subscriptions.filter(s => s.active)
  const totalSubs = activeSubs.reduce((a, s) => a + s.value, 0)

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Financeiro Pessoal</h1>
          <p className="mt-1 text-sm text-zinc-500">Controle suas receitas e despesas pessoais</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Nova Transação</Button>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Receitas</span>
          </div>
          <p className="text-lg font-bold text-emerald-500">{formatCurrency(income)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight size={14} className="text-red-500" />
            <span className="text-xs font-medium text-zinc-500">Despesas</span>
          </div>
          <p className="text-lg font-bold text-red-500">{formatCurrency(expenses)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <PiggyBank size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-zinc-500">Saldo</span>
          </div>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Assinaturas / Streams */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">Streams & Assinaturas</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">Total/mês: <strong className="text-emerald-500">{formatCurrency(totalSubs)}</strong></span>
            <Button size="sm" onClick={() => setShowSubForm(true)}><Plus size={14} /> Nova</Button>
          </div>
        </div>
        {activeSubs.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhuma assinatura ativa. Adicione Netflix, Spotify, etc.</p>
        ) : (
          <div className="space-y-2">
            {activeSubs.map(sub => (
              <div key={sub.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Film size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{sub.name}</p>
                    <p className="text-xs text-zinc-500">Vence dia {sub.dueDay} · {sub.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">{formatCurrency(sub.value)}</span>
                  <button onClick={() => { setEditSub(sub); setShowSubForm(true) }} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"><Pencil size={12} /></button>
                  <button onClick={() => deleteSubscription(sub.id)} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {(['month', 'year', 'all'] as FilterPeriod[]).map(p => (
          <Button key={p} variant={period === p ? 'primary' : 'secondary'} size="sm" onClick={() => setPeriod(p)}>
            {p === 'month' ? 'Este Mês' : p === 'year' ? 'Este Ano' : 'Tudo'}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden p-4">
        <TransactionTable transactions={filtered} categories={state.personalCategories} module="personal" onDelete={deleteTransaction} onUpdate={updateTransaction} />
      </div>

      {showForm && (
        <TransactionForm categories={state.personalCategories} module="personal" clients={[]}
          onSave={(t) => { addTransaction({ date: t.date, category: t.category, description: t.description, value: t.value, type: t.type, module: 'personal' }); setShowForm(false) }}
          onClose={() => setShowForm(false)} />
      )}

      {showSubForm && (
        <SubForm sub={editSub} onSave={(data) => { editSub ? (updateSubscription({ ...editSub, ...data }), setEditSub(null)) : addSubscription(data); setShowSubForm(false); setEditSub(null) }} onClose={() => { setShowSubForm(false); setEditSub(null) }} />
      )}
    </div>
  )
}

function SubForm({ sub, onSave, onClose }: {
  sub?: Subscription | null
  onSave: (data: Omit<Subscription, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(sub?.name || '')
  const [value, setValue] = useState(sub ? String(sub.value) : '')
  const [category, setCategory] = useState(sub?.category || 'Streaming')
  const [dueDay, setDueDay] = useState(sub ? String(sub.dueDay) : '15')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !value) return
    onSave({ name: name.trim(), value: Math.abs(parseFloat(value)), category, dueDay: parseInt(dueDay) || 15, active: true })
  }

  return (
    <Modal title={sub ? 'Editar Assinatura' : 'Nova Assinatura'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" placeholder="Ex: Netflix" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex gap-2">
          <div className="flex-1">
            <Input label="Valor (R$)" type="number" step="0.01" placeholder="29,90" value={value} onChange={e => setValue(e.target.value)} required />
          </div>
          <div className="w-28">
            <Input label="Dia Vencimento" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
            {['Streaming', 'Música', 'Armazenamento', 'Software', 'Academia', 'Seguro', 'Assinatura', 'Outros'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{sub ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

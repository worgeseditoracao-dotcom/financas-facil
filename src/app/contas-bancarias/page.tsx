'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2, TrendingUp, TrendingDown, PiggyBank, Briefcase, DollarSign } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { BANKS } from '@/lib/constants'
import type { BankAccount } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function BankAccounts() {
  const { state, addBankAccount, updateBankAccount, deleteBankAccount } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BankAccount | null>(null)
  const [tab, setTab] = useState<'personal' | 'business'>('personal')

  const accounts = state.bankAccounts.filter(a => a.module === tab)
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0)
  const positiveBalance = accounts.filter(a => a.balance >= 0).reduce((acc, a) => acc + a.balance, 0)
  const negativeBalance = Math.abs(accounts.filter(a => a.balance < 0).reduce((acc, a) => acc + a.balance, 0))

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Contas Bancárias</h1>
          <p className="mt-1 text-sm text-zinc-500">Acompanhe o saldo de todas as suas contas</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Nova Conta</Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('personal')} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Pessoal</button>
        <button onClick={() => setTab('business')} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Negócio (PJ)</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1"><DollarSign size={14} className="text-emerald-400" /><span className="text-xs font-medium text-zinc-500">Saldo Total</span></div>
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-400" /><span className="text-xs font-medium text-zinc-500">Total Positivo</span></div>
          <p className="text-lg font-bold text-emerald-400">{formatCurrency(positiveBalance)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-red-400" /><span className="text-xs font-medium text-zinc-500">Total Negativo</span></div>
          <p className="text-lg font-bold text-red-400">{formatCurrency(negativeBalance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {accounts.map(acc => (
          <div key={acc.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  {acc.type === 'checking' ? <Building2 size={20} className="text-emerald-400" /> :
                   acc.type === 'savings' ? <PiggyBank size={20} className="text-emerald-400" /> :
                   acc.type === 'investment' ? <TrendingUp size={20} className="text-emerald-400" /> :
                   acc.type === 'business' ? <Briefcase size={20} className="text-emerald-400" /> :
                   <DollarSign size={20} className="text-emerald-400" />}
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900">{acc.name}</h3>
                  <p className="text-xs text-zinc-500">{acc.bank} · {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : acc.type === 'salary' ? 'Salário' : acc.type === 'investment' ? 'Investimentos' : 'Empresarial'}</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${acc.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(acc.balance)}</p>
            </div>
            <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(acc)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
              <button onClick={() => deleteBankAccount(acc.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-500">
            <Building2 size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhuma conta bancária</p>
            <p className="text-sm mt-1">Adicione suas contas para centralizar os saldos</p>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <AccountForm
          account={editing}
          onSave={(data) => { editing ? (updateBankAccount({ ...editing, ...data }), setEditing(null)) : (addBankAccount(data), setShowForm(false)) }}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function AccountForm({ account, onSave, onClose }: {
  account?: BankAccount | null
  onSave: (data: Omit<BankAccount, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(account?.name || '')
  const [bank, setBank] = useState(account?.bank || 'Nubank')
  const [type, setType] = useState<'checking' | 'savings' | 'salary' | 'investment' | 'business'>(account?.type || 'checking')
  const [balance, setBalance] = useState(account ? String(account.balance) : '')
  const [module, setModule] = useState<'personal' | 'business'>(account?.module || 'personal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onSave({ name: name.trim(), bank, type, balance: parseFloat(balance) || 0, module, color: account?.color })
  }

  return (
    <Modal title={account ? 'Editar Conta' : 'Nova Conta Bancária'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome da Conta" placeholder="Ex: Nubank" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Banco</label>
          <select value={bank} onChange={e => setBank(e.target.value)} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30">
            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Tipo</label>
          <div className="flex flex-wrap gap-2">
            {([['checking', 'Corrente'], ['savings', 'Poupança'], ['salary', 'Salário'], ['investment', 'Investimentos'], ['business', 'Empresarial']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setType(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${type === value ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{label}</button>
            ))}
          </div>
        </div>
        <Input label="Saldo Atual (R$)" type="number" step="0.01" placeholder="0,00" value={balance} onChange={e => setBalance(e.target.value)} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{account ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
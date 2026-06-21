'use client'

import { Pencil, Trash2, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { Transaction, Category } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import TransactionForm from './TransactionForm'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  module: 'personal' | 'business'
  onDelete: (id: string) => void
  onUpdate: (transaction: Transaction) => void
}

export default function TransactionTable({ transactions, categories, module, onDelete, onUpdate }: Props) {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Transaction | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions
    const q = search.toLowerCase()
    return transactions.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }, [transactions, search])

  return (
    <>
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input type="text" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="px-3 py-3 text-left font-medium text-zinc-500">Data</th>
              <th className="px-3 py-3 text-left font-medium text-zinc-500">Categoria</th>
              <th className="px-3 py-3 text-left font-medium text-zinc-500">Descrição</th>
              <th className="px-3 py-3 text-right font-medium text-zinc-500">Valor</th>
              <th className="px-3 py-3 text-right font-medium text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-zinc-200 hover:bg-zinc-100">
                <td className="px-3 py-3 text-zinc-500">{formatDate(t.date)}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-500">{t.category}</span>
                </td>
                <td className="px-3 py-3 text-zinc-900">{t.description}</td>
                <td className={`px-3 py-3 text-right font-medium ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(t.value))}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setEditing(t)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
                    <button onClick={() => onDelete(t.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-12 text-center text-zinc-500">Nenhuma transação encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <TransactionForm transaction={editing} categories={categories} module={module}
          onSave={(updated) => { onUpdate(updated); setEditing(null) }} onClose={() => setEditing(null)} />
      )}
    </>
  )
}
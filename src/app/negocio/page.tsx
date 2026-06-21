'use client'

import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { useStore } from '@/lib/store'
import { filterTransactionsByModule, filterTransactionsByPeriod, calculateIncome, calculateExpenses, formatCurrency } from '@/lib/utils'
import type { FilterPeriod } from '@/lib/types'
import TransactionTable from '@/components/finance/TransactionTable'
import TransactionForm from '@/components/finance/TransactionForm'
import Button from '@/components/ui/Button'

export default function BusinessFinance() {
  const { state, addTransaction, updateTransaction, deleteTransaction } = useStore()
  const [period, setPeriod] = useState<FilterPeriod>('month')
  const [showForm, setShowForm] = useState(false)

  const businessTransactions = useMemo(
    () => filterTransactionsByModule(state.transactions, 'business'),
    [state.transactions]
  )

  const filtered = useMemo(
    () => filterTransactionsByPeriod(businessTransactions, period),
    [businessTransactions, period]
  )

  const revenue = calculateIncome(filtered)
  const costs = calculateExpenses(filtered)
  const profit = revenue - costs
  const margin = revenue > 0 ? ((profit / revenue) * 100) : 0

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fluxo de Caixa</h1>
          <p className="mt-1 text-sm text-zinc-500">Controle financeiro do seu negócio</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Nova Transação</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Vendas/Serviços</span>
          </div>
          <p className="text-lg font-bold text-emerald-500">{formatCurrency(revenue)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-500" />
            <span className="text-xs font-medium text-zinc-500">Custos/Despesas</span>
          </div>
          <p className="text-lg font-bold text-red-500">{formatCurrency(costs)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-blue-400" />
            <span className="text-xs font-medium text-zinc-500">Lucro Líquido</span>
          </div>
          <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(profit)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Margem</span>
          </div>
          <p className={`text-lg font-bold ${margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{margin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['month', 'year', 'all'] as FilterPeriod[]).map(p => (
          <Button key={p} variant={period === p ? 'primary' : 'secondary'} size="sm" onClick={() => setPeriod(p)}>
            {p === 'month' ? 'Este Mês' : p === 'year' ? 'Este Ano' : 'Tudo'}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden p-4">
        <TransactionTable transactions={filtered} categories={state.businessCategories} module="business" onDelete={deleteTransaction} onUpdate={updateTransaction} />
      </div>

      {showForm && (
        <TransactionForm categories={state.businessCategories} module="business" clients={state.clients}
          onSave={(t) => { addTransaction({ date: t.date, category: t.category, description: t.description, value: t.value, type: t.type, module: 'business' }); setShowForm(false) }}
          onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
'use client'

import { useState, useMemo } from 'react'
import { CalendarRange, TrendingUp, TrendingDown, AlertTriangle, Briefcase, User } from 'lucide-react'
import { useStore } from '@/lib/store'
import { calculateIncome, calculateExpenses, filterTransactionsByPeriod, filterTransactionsByModule, formatCurrency } from '@/lib/utils'

export default function Planning() {
  const { state, setBudget } = useStore()
  const { transactions, budgets } = state
  const [tab, setTab] = useState<'personal' | 'business'>('personal')

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const currentBudget = budgets.find(b => b.month === monthKey && b.module === tab)

  const moduleTransactions = useMemo(
    () => filterTransactionsByModule(transactions, tab),
    [transactions, tab]
  )

  const monthlyTransactions = useMemo(
    () => filterTransactionsByPeriod(moduleTransactions, 'month'),
    [moduleTransactions]
  )

  const actualIncome = calculateIncome(monthlyTransactions)
  const actualExpenses = calculateExpenses(monthlyTransactions)

  const [expectedIncome, setExpectedIncome] = useState(currentBudget?.expectedIncome?.toString() || '')
  const [expectedExpenses, setExpectedExpenses] = useState(currentBudget?.expectedExpenses?.toString() || '')

  const handleSave = () => {
    const income = parseFloat(expectedIncome) || 0
    const expenses = parseFloat(expectedExpenses) || 0
    if (income > 0 || expenses > 0) {
      setBudget({
        month: monthKey,
        year: currentYear,
        expectedIncome: income,
        expectedExpenses: expenses,
        module: tab,
      })
    }
  }

  const expectedSavings = (parseFloat(expectedIncome) || 0) - (parseFloat(expectedExpenses) || 0)
  const actualSavings = actualIncome - actualExpenses
  const incomeDiff = actualIncome - (parseFloat(expectedIncome) || 0)
  const expenseDiff = (parseFloat(expectedExpenses) || 0) - actualExpenses

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  return (
    <div className="space-y-6 animate-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Planejamento Mensal</h1>
        <p className="mt-1 text-sm text-zinc-500">{months[currentMonth - 1]} de {currentYear}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setTab('personal'); setExpectedIncome(currentBudget?.expectedIncome?.toString() || ''); setExpectedExpenses(currentBudget?.expectedExpenses?.toString() || '') }}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>
          <User size={16} className="inline mr-1" />Pessoal
        </button>
        <button onClick={() => { setTab('business'); setExpectedIncome(currentBudget?.expectedIncome?.toString() || ''); setExpectedExpenses(currentBudget?.expectedExpenses?.toString() || '') }}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>
          <Briefcase size={16} className="inline mr-1" />Negócio (PJ)
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Previsto Receber</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(parseFloat(expectedIncome) || 0)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-500" />
            <span className="text-xs font-medium text-zinc-500">Previsto Gastar</span>
          </div>
          <p className="text-lg font-bold text-zinc-900">{formatCurrency(parseFloat(expectedExpenses) || 0)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Sobra Prevista</span>
          </div>
          <p className={`text-lg font-bold ${expectedSavings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(expectedSavings)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarRange size={16} className="text-blue-500" />
            <span className="text-xs font-medium text-zinc-500">Diferença</span>
          </div>
          <p className={`text-lg font-bold ${actualSavings >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(actualSavings)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Definir Orçamento Mensal</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Quanto pretende ganhar?</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <input
                type="number" step="0.01" placeholder="0,00"
                value={expectedIncome}
                onChange={e => setExpectedIncome(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Quanto pretende gastar?</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <input
                type="number" step="0.01" placeholder="0,00"
                value={expectedExpenses}
                onChange={e => setExpectedExpenses(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black hover:bg-emerald-600 transition-colors"
        >
          Salvar Planejamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">Comparativo Receitas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Previsto</span>
              <span className="text-sm text-zinc-900">{formatCurrency(parseFloat(expectedIncome) || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Realizado</span>
              <span className="text-sm text-emerald-500">{formatCurrency(actualIncome)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-900">Diferença</span>
              <span className={`text-sm font-medium ${incomeDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {incomeDiff >= 0 ? '+' : ''}{formatCurrency(incomeDiff)}
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">Comparativo Despesas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Previsto</span>
              <span className="text-sm text-zinc-900">{formatCurrency(parseFloat(expectedExpenses) || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Realizado</span>
              <span className="text-sm text-red-500">{formatCurrency(actualExpenses)}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-900">Economia</span>
              <span className={`text-sm font-medium ${expenseDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {expenseDiff >= 0 ? '+' : ''}{formatCurrency(expenseDiff)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {expectedExpenses && actualExpenses > parseFloat(expectedExpenses) && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Alerta de Estouro!</p>
            <p className="text-sm text-zinc-500 mt-1">
              Você já gastou {formatCurrency(actualExpenses - parseFloat(expectedExpenses))} acima do previsto para este mês.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { CalendarRange, TrendingUp, TrendingDown, AlertTriangle, Briefcase, User, BarChart3, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '@/lib/store'
import { calculateIncome, calculateExpenses, filterTransactionsByPeriod, filterTransactionsByModule, formatCurrency, groupByCategory } from '@/lib/utils'

type CategoryBudget = Record<string, { limit: number; color: string }>

export default function Planning() {
  const { state, setBudget } = useStore()
  const { transactions, budgets, personalCategories, businessCategories } = state
  const [tab, setTab] = useState<'personal' | 'business'>('personal')
  const [viewMonth, setViewMonth] = useState(new Date().getMonth()) // 0-11
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  const now = new Date(viewYear, viewMonth, 1)
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  const isCurrentMonth = now.getMonth() === new Date().getMonth() && now.getFullYear() === new Date().getFullYear()

  const currentBudget = budgets.find(b => b.month === monthKey && b.module === tab)
  const categories = tab === 'personal' ? personalCategories : businessCategories

  const moduleTransactions = useMemo(() => filterTransactionsByModule(transactions, tab), [transactions, tab])
  const monthlyTransactions = useMemo(() => {
    const start = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
    const endDay = new Date(currentYear, currentMonth, 0).getDate()
    const end = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
    return moduleTransactions.filter(t => t.date >= start && t.date <= end)
  }, [moduleTransactions, currentYear, currentMonth])

  const actualIncome = calculateIncome(monthlyTransactions)
  const actualExpenses = calculateExpenses(monthlyTransactions)
  const expenseByCategory = useMemo(() => groupByCategory(monthlyTransactions.filter(t => t.type === 'expense')), [monthlyTransactions])

  const [expectedIncome, setExpectedIncome] = useState(currentBudget?.expectedIncome?.toString() || '')
  const [expectedExpenses, setExpectedExpenses] = useState(currentBudget?.expectedExpenses?.toString() || '')

  // Per-category budgets - persistido no localStorage
  const storageKey = `cat-budget-${monthKey}-${tab}`
  const [catBudgets, setCatBudgets] = useState<CategoryBudget>(() => {
    if (typeof window === 'undefined') return {}
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    if (Object.keys(catBudgets).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(catBudgets))
    }
  }, [catBudgets, storageKey])

  const updateCatBudget = (category: string, limit: number) => {
    setCatBudgets(prev => {
      if (limit <= 0) {
        const next = { ...prev }
        delete next[category]
        return next
      }
      return { ...prev, [category]: { limit, color: categories.find(c => c.name === category)?.color || '#8B5CF6' } }
    })
  }

  const handleSave = () => {
    const income = parseFloat(expectedIncome) || 0
    const expenses = parseFloat(expectedExpenses) || 0
    if (income > 0 || expenses > 0) {
      setBudget({ month: monthKey, year: currentYear, expectedIncome: income, expectedExpenses: expenses, module: tab })
    }
  }

  const expectedSavings = (parseFloat(expectedIncome) || 0) - (parseFloat(expectedExpenses) || 0)
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  return (
    <div className="space-y-6 animate-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Planejamento Mensal</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{months[currentMonth - 1]} de {currentYear}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) } else setViewMonth(viewMonth - 1) }}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronLeft size={18} />
          </button>
          {isCurrentMonth ? (
            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">Atual</span>
          ) : (
            <button onClick={() => { setViewMonth(new Date().getMonth()); setViewYear(new Date().getFullYear()) }}
              className="text-xs text-zinc-500 hover:text-emerald-500 px-2 py-1">Hoje</button>
          )}
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) } else setViewMonth(viewMonth + 1) }}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setTab('personal'); setExpectedIncome(currentBudget?.expectedIncome?.toString() || ''); setExpectedExpenses(currentBudget?.expectedExpenses?.toString() || '') }}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'personal' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
          <User size={16} className="inline mr-1" />Pessoal
        </button>
        <button onClick={() => { setTab('business'); setExpectedIncome(currentBudget?.expectedIncome?.toString() || ''); setExpectedExpenses(currentBudget?.expectedExpenses?.toString() || '') }}
          className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'business' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
          <Briefcase size={16} className="inline mr-1" />Negócio (PJ)
        </button>
      </div>

      {/* Global budget cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card icon={<TrendingUp size={16} className="text-emerald-500" />} label="Previsto Receber" value={formatCurrency(parseFloat(expectedIncome) || 0)} />
        <Card icon={<TrendingDown size={16} className="text-red-500" />} label="Previsto Gastar" value={formatCurrency(parseFloat(expectedExpenses) || 0)} />
        <Card icon={<PiggyBank size={16} className="text-blue-500" />} label="Sobra Prevista" value={formatCurrency(expectedSavings)} cls={expectedSavings >= 0 ? 'text-emerald-500' : 'text-red-500'} />
        <Card icon={<BarChart3 size={16} className="text-purple-500" />} label="Gasto Real" value={formatCurrency(actualExpenses)} cls="text-red-500" />
      </div>

      {/* Global budget form */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Orçamento Global</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Quanto pretende ganhar?</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <input type="number" step="0.01" placeholder="0,00" value={expectedIncome} onChange={e => setExpectedIncome(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-8 pr-3 text-sm text-zinc-900 dark:text-zinc-50" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Quanto pretende gastar?</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <input type="number" step="0.01" placeholder="0,00" value={expectedExpenses} onChange={e => setExpectedExpenses(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-8 pr-3 text-sm text-zinc-900 dark:text-zinc-50" />
            </div>
          </div>
        </div>
        <button onClick={handleSave}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">
          Salvar Planejamento
        </button>
      </div>

      {/* PER-CATEGORY BUDGET */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Orçamento por Categoria</h2>
        <p className="text-xs text-zinc-500 mb-4">Defina limites de gasto para cada categoria. Alertas aparecem quando estoura.</p>

        <div className="space-y-3">
          {categories.map(cat => {
            const spending = expenseByCategory.find(e => e.category === cat.name)
            const actual = spending?.value || 0
            const budget = catBudgets[cat.name]
            const limit = budget?.limit || 0
            const percentage = limit > 0 ? Math.min(100, (actual / limit) * 100) : 0
            const isOver = limit > 0 && actual > limit
            const color = cat.color || '#8B5CF6'

            return (
              <div key={cat.name} className="rounded-xl border border-zinc-100 dark:border-zinc-800 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    Gasto: <span className={isOver ? 'text-red-500 font-bold' : 'text-zinc-600'}>{formatCurrency(actual)}</span>
                    {limit > 0 && <> / {formatCurrency(limit)}</>}
                  </span>
                </div>

                {/* Progress bar */}
                {limit > 0 && (
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: isOver ? '#ef4444' : percentage > 80 ? '#f59e0b' : color }} />
                  </div>
                )}

                {/* Budget input */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-zinc-400">Limite:</span>
                  <input
                    type="number" step="0.01" placeholder="Sem limite"
                    value={limit || ''}
                    onChange={e => updateCatBudget(cat.name, parseFloat(e.target.value) || 0)}
                    className="h-7 w-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-700 dark:text-zinc-300"
                  />
                  {limit > 0 && (
                    <span className="text-[10px] font-medium" style={{ color: isOver ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#22c55e' }}>
                      {isOver ? '🔴 Estourou!' : percentage > 80 ? '🟡 Atenção' : '🟢 OK'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Global overspend alert */}
      {expectedExpenses && actualExpenses > parseFloat(expectedExpenses) && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-500">Alerta de Estouro Global!</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Você já gastou {formatCurrency(actualExpenses - parseFloat(expectedExpenses))} acima do previsto para este mês.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ icon, label, value, cls = '' }: { icon: React.ReactNode; label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-medium text-zinc-500">{label}</span></div>
      <p className={`text-lg font-bold ${cls || 'text-zinc-900 dark:text-zinc-50'}`}>{value}</p>
    </div>
  )
}

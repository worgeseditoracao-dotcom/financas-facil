'use client'

import { useStore } from '@/lib/store'
import { calculateBalance, calculateIncome, calculateExpenses, filterTransactionsByPeriod, filterTransactionsByModule, formatCurrency } from '@/lib/utils'
import { useMemo } from 'react'
import { Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, TrendingUp, BarChart3, Target, DollarSign, AlertTriangle, CalendarDays, ArrowRight, TrendingDown } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'
import EvolutionChart from '@/components/dashboard/EvolutionChart'

export default function Dashboard() {
  const { state } = useStore()
  const { transactions, goals, clients, bills, creditCards, receivables, bankAccounts } = state
  const fmt = (v: number) => formatCurrency(v, state.settings.currency)

  const monthlyTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, 'month'),
    [transactions]
  )

  const allTimeBalance = calculateBalance(transactions)
  const monthlyIncome = calculateIncome(monthlyTransactions)
  const monthlyExpense = calculateExpenses(monthlyTransactions)
  const monthlySavings = monthlyIncome - monthlyExpense
  const netWorth = allTimeBalance
  const cashFlow = monthlyIncome - monthlyExpense

  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.currentValue >= g.targetValue).length

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'active').length

  const today = new Date().toISOString().split('T')[0]
  const monthEnd = new Date()
  monthEnd.setMonth(monthEnd.getMonth() + 1)
  monthEnd.setDate(0)
  const monthEndStr = monthEnd.toISOString().split('T')[0]

  const dueMonthBills = useMemo(() =>
    bills.filter(b => !b.paid && b.dueDate >= today && b.dueDate <= monthEndStr).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [bills, today, monthEndStr]
  )

  const overdueBills = useMemo(() =>
    bills.filter(b => !b.paid && b.dueDate < today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [bills, today]
  )

  const totalDueMonth = dueMonthBills.reduce((a, b) => a + b.value, 0)
  const totalOverdue = overdueBills.reduce((a, b) => a + b.value, 0)

  const receivablesDue = useMemo(() => {
    const now = new Date()
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const endStr = endMonth.toISOString().split('T')[0]
    return receivables.filter(r => !r.received && r.dueDate <= endStr && r.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [receivables, today])

  const receivablesTotal = receivablesDue.reduce((a, r) => a + r.value, 0)
  const receivablesOverdue = receivables.filter(r => !r.received && r.dueDate < today)
  const totalReceivablesOverdue = receivablesOverdue.reduce((a, r) => a + r.value, 0)

  const bankTotal = bankAccounts.reduce((a, b) => a + b.balance, 0)
  const totalBillsDue = dueMonthBills.reduce((a, b) => a + b.value, 0) + totalOverdue
  const cashFlowForecast = bankTotal + receivablesTotal - totalBillsDue

  const cardUtilization = useMemo(() => {
    return creditCards.map(c => {
      const used = c.purchases.filter(p => !p.paid).reduce((a, p) => a + (p.installments > 1 ? p.value / p.installments : p.value), 0)
      return { name: c.name, used, limit: c.limit, pct: c.limit > 0 ? ((used / c.limit) * 100).toFixed(0) : '0' }
    })
  }, [creditCards])

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Visão geral das suas finanças</p>
      </div>

      {/* Alertas */}
      {overdueBills.length > 0 && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-red-500">{overdueBills.length} conta(s) em atraso!</p>
            <p className="text-sm text-zinc-500 mt-1">Total de {fmt(totalOverdue)} em contas vencidas. Regularize para evitar juros.</p>
          </div>
        </div>
      )}

      {/* Cartões próximos ao limite */}
      {cardUtilization.filter(c => parseInt(c.pct) > 80).map(c => (
        <div key={c.name} className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-yellow-500">{c.name} com {c.pct}% de utilização!</p>
            <p className="text-sm text-zinc-500 mt-1">Usado {fmt(c.used)} de {fmt(c.limit)} de limite.</p>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard title="Saldo Atual" value={fmt(allTimeBalance)} icon={<Wallet size={20} />} variant="default" />
        <StatCard title="Total Recebido (Mês)" value={fmt(monthlyIncome)} icon={<ArrowUpRight size={20} />} variant="income" />
        <StatCard title="Total Gasto (Mês)" value={fmt(monthlyExpense)} icon={<ArrowDownRight size={20} />} variant="expense" />
        <StatCard title="Economia do Mês" value={fmt(Math.max(0, monthlySavings))} icon={<PiggyBank size={20} />} variant="savings" />
        <StatCard title="Patrimônio Acumulado" value={fmt(netWorth)} icon={<TrendingUp size={20} />} variant="default" />
        <StatCard title="Fluxo de Caixa" value={fmt(cashFlow)} icon={<BarChart3 size={20} />} variant={cashFlow >= 0 ? 'income' : 'expense'} />
        <StatCard title="Metas" value={`${completedGoals}/${totalGoals}`} icon={<Target size={20} />} variant="default" />
        <StatCard title="Clientes Ativos" value={String(activeClients)} icon={<DollarSign size={20} />} variant="default" />
      </div>

      {/* Previsão de Caixa */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-emerald-500" />
          <h2 className="text-base font-semibold text-zinc-900">Previsão de Caixa</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl bg-zinc-50 p-3">
            <span className="text-[10px] font-medium text-zinc-500">Saldo Bancos</span>
            <p className="text-sm font-bold mt-0.5">{fmt(bankTotal)}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 p-3">
            <span className="text-[10px] font-medium text-emerald-500">A Receber (mês)</span>
            <p className="text-sm font-bold text-emerald-500 mt-0.5">{fmt(receivablesTotal)}</p>
          </div>
          <div className="rounded-xl bg-red-500/5 p-3">
            <span className="text-[10px] font-medium text-red-500">A Pagar (mês)</span>
            <p className="text-sm font-bold text-red-500 mt-0.5">{fmt(totalBillsDue)}</p>
          </div>
          <div className="rounded-xl bg-blue-500/5 p-3">
            <span className="text-[10px] font-medium text-blue-500">Saldo Projetado</span>
            <p className={`text-sm font-bold mt-0.5 ${cashFlowForecast >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(cashFlowForecast)}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <span className="text-[10px] font-medium text-zinc-500">Receb. Atrasados</span>
            <p className={`text-sm font-bold mt-0.5 ${totalReceivablesOverdue > 0 ? 'text-red-500' : 'text-zinc-900'}`}>{fmt(totalReceivablesOverdue)}</p>
          </div>
        </div>
        {totalReceivablesOverdue > 0 && (
          <div className="mt-3 rounded-xl bg-orange-500/5 border border-orange-500/20 p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-600">{receivablesOverdue.length} recebimento(s) atrasado(s) totalizando {fmt(totalReceivablesOverdue)}. Cobre seus clientes.</p>
          </div>
        )}
      </div>

      {/* Contas do Mês */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
            <CalendarDays size={16} /> Contas a Pagar este Mês
          </h3>
          <span className="text-sm text-zinc-900 font-bold">{fmt(totalDueMonth)}</span>
        </div>
        {dueMonthBills.length === 0 && overdueBills.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhuma conta pendente. Tudo em dia! 🎉</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {overdueBills.map(b => (
              <div key={b.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-red-500/5">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle size={12} className="text-red-500 shrink-0" />
                  <span className="text-sm text-zinc-900 truncate">{b.name}</span>
                  <span className="text-[10px] text-red-500 font-medium">Venceu</span>
                </div>
                <span className="text-sm font-medium text-red-500 shrink-0">{fmt(b.value)}</span>
              </div>
            ))}
            {dueMonthBills.slice(0, 8).map(b => {
              const daysLeft = Math.ceil((new Date(b.dueDate).getTime() - Date.now()) / 86400000)
              return (
                <div key={b.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-zinc-400 shrink-0">{new Date(b.dueDate).toLocaleDateString('pt-BR')}</span>
                    <span className="text-sm text-zinc-900 truncate">{b.name}</span>
                    {daysLeft <= 3 && <span className="text-[10px] text-yellow-500 font-medium">Em {daysLeft}d</span>}
                  </div>
                  <span className="text-sm font-medium text-zinc-900 shrink-0">{fmt(b.value)}</span>
                </div>
              )
            })}
            {dueMonthBills.length > 8 && (
              <p className="text-xs text-zinc-500 text-center pt-2">+{dueMonthBills.length - 8} contas restantes</p>
            )}
          </div>
        )}
      </div>

      {/* Próximos Recebimentos */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
            <ArrowUpRight size={16} /> Próximos Recebimentos
          </h3>
          <span className="text-sm text-zinc-900 font-bold">{fmt(receivablesTotal)}</span>
        </div>
        {receivablesDue.length === 0 && receivablesOverdue.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">Nenhum recebimento previsto.</p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {receivablesOverdue.slice(0, 3).map(r => (
              <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-red-500/5">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle size={12} className="text-red-500 shrink-0" />
                  <span className="text-sm text-zinc-900 truncate">{r.name}</span>
                  <span className="text-[10px] text-red-500 font-medium">Atrasado</span>
                </div>
                <span className="text-sm font-medium text-red-500 shrink-0">{fmt(r.value)}</span>
              </div>
            ))}
            {receivablesDue.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-zinc-400 shrink-0">{new Date(r.dueDate).toLocaleDateString('pt-BR')}</span>
                  <span className="text-sm text-zinc-900 truncate">{r.name}</span>
                </div>
                <span className="text-sm font-medium text-emerald-500 shrink-0">{fmt(r.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-500">Receitas x Despesas</h3>
          <IncomeExpenseChart transactions={monthlyTransactions} />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-500">Gastos por Categoria</h3>
          <CategoryPieChart transactions={monthlyTransactions.filter(t => t.type === 'expense')} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-500">Evolução Patrimonial</h3>
          <EvolutionChart transactions={transactions} />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-500">Entradas por Categoria</h3>
          <CategoryPieChart transactions={monthlyTransactions.filter(t => t.type === 'income')} />
        </div>
      </div>
    </div>
  )
}

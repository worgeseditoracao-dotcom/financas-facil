'use client'

import { useMemo } from 'react'
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart3, Target, DollarSign } from 'lucide-react'
import { useStore } from '@/lib/store'
import { calculateIncome, calculateExpenses, filterTransactionsByPeriod, groupByCategory, formatCurrency } from '@/lib/utils'
import type { Insight } from '@/lib/types'

export default function Insights() {
  const { state } = useStore()
  const { transactions, goals, bills, clients } = state

  const insights = useMemo((): Insight[] => {
    const result: Insight[] = []
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const monthTransactions = filterTransactionsByPeriod(transactions, 'month')
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const lastMonthTransactions = transactions.filter(t => {
      return t.date >= lastMonthStart.toISOString().split('T')[0] && t.date <= lastMonthEnd.toISOString().split('T')[0]
    })

    const monthlyIncome = calculateIncome(monthTransactions)
    const monthlyExpenses = calculateExpenses(monthTransactions)
    const lastMonthIncome = calculateIncome(lastMonthTransactions)
    const lastMonthExpenses = calculateExpenses(lastMonthTransactions)

    // Income comparison
    if (lastMonthIncome > 0) {
      const incomeChange = ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100
      if (incomeChange > 0) {
        result.push({
          type: 'success',
          message: `Sua receita cresceu ${incomeChange.toFixed(1)}% em relação ao mês passado.`,
          icon: 'trending-up'
        })
      } else if (incomeChange < 0) {
        result.push({
          type: 'warning',
          message: `Sua receita caiu ${Math.abs(incomeChange).toFixed(1)}% em relação ao mês passado.`,
          icon: 'trending-down'
        })
      }
    }

    // Expense analysis
    if (lastMonthExpenses > 0) {
      const expenseChange = ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      if (expenseChange > 10) {
        result.push({
          type: 'warning',
          message: `Seus gastos aumentaram ${expenseChange.toFixed(1)}% em relação ao mês passado. Reveja suas despesas.`,
          icon: 'alert'
        })
      } else if (expenseChange < -5) {
        result.push({
          type: 'success',
          message: `Você reduziu seus gastos em ${Math.abs(expenseChange).toFixed(1)}%! Continue assim!`,
          icon: 'check'
        })
      }
    }

    // Spending by category alerts
    const categoryExpenses = groupByCategory(monthTransactions.filter(t => t.type === 'expense'))
    const totalExpenses = categoryExpenses.reduce((acc, c) => acc + c.value, 0)
    for (const cat of categoryExpenses) {
      const pct = (cat.value / totalExpenses) * 100
      if (pct > 30) {
        result.push({
          type: 'warning',
          message: `Você gastou ${pct.toFixed(0)}% do seu orçamento em ${cat.category}. Considere reduzir esses gastos.`,
          icon: 'alert'
        })
      }
    }

    // Cash reserve analysis
    const allTimeBalance = transactions.reduce((acc, t) => acc + t.value, 0)
    if (monthlyExpenses > 0) {
      const monthsCovered = allTimeBalance / monthlyExpenses
      if (monthsCovered >= 6) {
        result.push({
          type: 'success',
          message: `Seu saldo cobre ${monthsCovered.toFixed(1)} meses de despesas. Ótima reserva de emergência!`,
          icon: 'check'
        })
      } else if (monthsCovered < 3) {
        result.push({
          type: 'info',
          message: `Seu saldo cobre apenas ${monthsCovered.toFixed(1)} meses de despesas. Considere criar uma reserva de emergência de 6 meses.`,
          icon: 'target'
        })
      }
    }

    // Overdue bills
    const overdueBills = bills.filter(b => !b.paid && b.dueDate < today)
    if (overdueBills.length > 0) {
      const totalOverdue = overdueBills.reduce((acc, b) => acc + b.value, 0)
      result.push({
        type: 'warning',
        message: `Você tem ${overdueBills.length} conta(s) atrasada(s) totalizando ${formatCurrency(totalOverdue)}.`,
        icon: 'alert'
      })
    }

    // Goals progress
    const inProgressGoals = goals.filter(g => g.currentValue > 0 && g.currentValue < g.targetValue)
    if (inProgressGoals.length > 0) {
      const nearest = inProgressGoals.sort((a, b) => {
        const aPct = a.currentValue / a.targetValue
        const bPct = b.currentValue / b.targetValue
        return bPct - aPct
      })[0]
      const progress = Math.round((nearest.currentValue / nearest.targetValue) * 100)
      result.push({
        type: 'info',
        message: `Sua meta "${nearest.name}" está em ${progress}% concluída. Faltam ${formatCurrency(nearest.targetValue - nearest.currentValue)}.`,
        icon: 'target'
      })
    }

    // Income vs expense ratio
    if (monthlyIncome > 0 && monthlyExpenses > 0) {
      const ratio = (monthlyExpenses / monthlyIncome) * 100
      if (ratio > 80) {
        result.push({
          type: 'warning',
          message: `${ratio.toFixed(0)}% da sua receita vai para despesas. Tente manter abaixo de 70%.`,
          icon: 'alert'
        })
      } else if (ratio < 50) {
        result.push({
          type: 'success',
          message: `Você gasta apenas ${ratio.toFixed(0)}% da sua receita. Excelente controle financeiro!`,
          icon: 'check'
        })
      }
    }

    // Client insights
    const activeClients = clients.filter(c => c.status === 'active').length
    if (activeClients > 0) {
      result.push({
        type: 'info',
        message: `Você tem ${activeClients} cliente(s) ativo(s). Fature ${formatCurrency(clients.filter(c => c.status === 'active' && c.value).reduce((acc, c) => acc + (c.value || 0), 0))} com clientes ativos.`,
        icon: 'dollar'
      })
    }

    if (result.length === 0) {
      result.push({
        type: 'info',
        message: 'Adicione receitas e despesas para receber insights personalizados sobre suas finanças.',
        icon: 'lightbulb'
      })
    }

    return result
  }, [transactions, goals, bills, clients])

  const getIcon = (type: string, icon?: string) => {
    const baseClass = 'h-5 w-5'
    if (icon === 'trending-up') return <TrendingUp size={20} className="text-emerald-500" />
    if (icon === 'trending-down') return <TrendingDown size={20} className="text-red-500" />
    if (icon === 'check') return <CheckCircle2 size={20} className="text-emerald-500" />
    if (icon === 'alert') return <AlertTriangle size={20} className="text-orange-500" />
    if (icon === 'target') return <Target size={20} className="text-blue-400" />
    if (icon === 'dollar') return <DollarSign size={20} className="text-emerald-500" />
    return <Lightbulb size={20} className="text-blue-400" />
  }

  const getBg = (type: string) => {
    switch (type) {
      case 'warning': return 'border-orange-500/30 bg-orange-500/5'
      case 'success': return 'border-emerald-500/30 bg-emerald-500/5'
      default: return 'border-blue-400/30 bg-blue-400/5'
    }
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Inteligência Financeira</h1>
        <p className="mt-1 text-sm text-zinc-500">Insights inteligentes sobre suas finanças</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Seus Insights</h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className={`rounded-xl border p-4 flex items-start gap-3 ${getBg(insight.type)}`}>
              {getIcon(insight.type, insight.icon)}
              <div>
                <p className="text-sm text-zinc-900">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">Resumo Financeiro</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Receita Total</span>
              <span className="text-emerald-500">{formatCurrency(transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.value, 0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Despesa Total</span>
              <span className="text-red-500">{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((a, t) => a + Math.abs(t.value), 0))}</span>
            </div>
            <div className="border-t border-zinc-200 pt-2 flex justify-between font-medium">
              <span className="text-zinc-900">Saldo Global</span>
              <span className={transactions.reduce((a, t) => a + t.value, 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                {formatCurrency(transactions.reduce((a, t) => a + t.value, 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="text-sm font-semibold text-zinc-500 mb-3">Indicadores Rápidos</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Metas Concluídas</span>
              <span className="text-zinc-900">{goals.filter(g => g.currentValue >= g.targetValue).length}/{goals.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Contas em Dia</span>
              <span className="text-zinc-900">{bills.filter(b => b.paid).length}/{bills.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Clientes Ativos</span>
              <span className="text-zinc-900">{clients.filter(c => c.status === 'active').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
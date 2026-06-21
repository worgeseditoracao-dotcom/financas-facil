'use client'

import { useMemo, useState } from 'react'
import { Download, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react'
import { useStore } from '@/lib/store'
import { filterTransactionsByPeriod, filterTransactionsByModule, groupByCategory, calculateBalance, calculateIncome, calculateExpenses, formatCurrency } from '@/lib/utils'
import type { FilterPeriod } from '@/lib/types'
import { exportToExcel, exportToPDF, exportToCSV } from '@/lib/export'
import ReportFilters from '@/components/reports/ReportFilters'
import ReportCard from '@/components/reports/ReportCard'
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart'
import CategoryPieChart from '@/components/dashboard/CategoryPieChart'
import EvolutionChart from '@/components/dashboard/EvolutionChart'
import Button from '@/components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const { state } = useStore()
  const [period, setPeriod] = useState<FilterPeriod>('month')
  const [module, setModule] = useState<'all' | 'personal' | 'business'>('all')
  const [showDRE, setShowDRE] = useState(false)

  const filtered = useMemo(() => {
    const byModule = filterTransactionsByModule(state.transactions, module)
    return filterTransactionsByPeriod(byModule, period)
  }, [state.transactions, period, module])

  const incomeByCategory = useMemo(() => groupByCategory(filtered.filter(t => t.type === 'income')), [filtered])
  const expenseByCategory = useMemo(() => groupByCategory(filtered.filter(t => t.type === 'expense')), [filtered])
  const balance = calculateBalance(filtered)
  const totalIncome = calculateIncome(filtered)
  const totalExpenses = calculateExpenses(filtered)
  const netProfit = totalIncome - totalExpenses
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Relatórios</h1>
          <p className="mt-1 text-sm text-zinc-500">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportToExcel(filtered)}><Download size={16} /> Excel</Button>
          <Button variant="secondary" size="sm" onClick={() => exportToPDF(filtered)}><Download size={16} /> PDF</Button>
          <Button variant="secondary" size="sm" onClick={() => exportToCSV(filtered)}><Download size={16} /> CSV</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ReportFilters period={period} onPeriodChange={setPeriod} />
        <div className="flex gap-2">
          {(['all', 'personal', 'business'] as const).map(m => (
            <Button key={m} variant={module === m ? 'primary' : 'secondary'} size="sm" onClick={() => setModule(m)}>
              {m === 'all' ? 'Todos' : m === 'personal' ? 'Pessoal' : 'Negócio'}
            </Button>
          ))}
        </div>
      </div>

      {/* DRE */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <button onClick={() => setShowDRE(!showDRE)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">DRE - Demonstrativo de Resultados</h2>
          </div>
          <span className="text-xs text-zinc-500">{showDRE ? 'Recolher' : 'Expandir'}</span>
        </button>
        {showDRE && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-zinc-200">
              <span className="text-emerald-500 font-medium">1. Receita Bruta</span>
              <span className="text-emerald-500 font-bold">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200 pl-4">
              <span className="text-zinc-500">2. Deduções e Impostos</span>
              <span className="text-red-500">{formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200">
              <span className="text-zinc-900 font-medium">3. Receita Líquida</span>
              <span className="text-zinc-900 font-bold">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200">
              <span className="text-red-500 font-medium">4. Custos Variáveis</span>
              <span className="text-red-500 font-bold">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200">
              <span className="text-zinc-900 font-medium">5. Lucro Bruto</span>
              <span className={`font-bold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-200">
              <span className="text-zinc-900 font-medium">Margem Bruta</span>
              <span className={`font-bold ${profitMargin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-lg font-bold text-zinc-900">6. Resultado Líquido</span>
              <span className={`text-lg font-bold ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard title="Receitas por Categoria">
          {incomeByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeByCategory}>
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `R$${Number(v)}`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
                  <Bar dataKey="value" fill="#A855F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
          )}
        </ReportCard>

        <ReportCard title="Despesas por Categoria">
          {expenseByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseByCategory}>
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `R$${Number(v)}`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), '']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
                  <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
          )}
        </ReportCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard title="Evolução do Saldo">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">{formatCurrency(balance)}</span>
            <span className="text-sm text-zinc-500">no período</span>
          </div>
          <EvolutionChart transactions={filtered} />
        </ReportCard>
        <ReportCard title="Comparação Mensal">
          <IncomeExpenseChart transactions={filtered} />
        </ReportCard>
      </div>
    </div>
  )
}
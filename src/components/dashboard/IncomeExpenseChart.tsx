'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '@/lib/types'
import { groupByMonth } from '@/lib/utils'
import { useMemo } from 'react'

interface Props { transactions: Transaction[] }

export default function IncomeExpenseChart({ transactions }: Props) {
  const data = useMemo(() => groupByMonth(transactions), [transactions])

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => { const [, m] = v.split('-'); const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return months[parseInt(m) - 1] || v }} />
          <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `R$${Number(v)}`} />
          <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
          <Legend wrapperStyle={{ color: '#6B7280' }} />
          <Bar dataKey="income" name="Receitas" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
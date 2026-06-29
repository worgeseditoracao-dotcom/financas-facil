'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Cell } from 'recharts'
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
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} barSize={20}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
              <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC4899" stopOpacity={1} />
              <stop offset="100%" stopColor="#F472B6" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => {
            const [, m] = v.split('-')
            const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
            return months[parseInt(m) - 1] || v
          }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `R$${Number(v)}`} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
            contentStyle={{
              borderRadius: '16px', border: 'none', background: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '12px 16px',
              fontSize: '13px', color: '#1F2937',
            }}
            cursor={{ fill: '#F3F4F6', radius: 8 }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#6B7280' }} />
          <Bar dataKey="income" name="Receitas" fill="url(#incomeGrad)" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="url(#expenseGrad)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

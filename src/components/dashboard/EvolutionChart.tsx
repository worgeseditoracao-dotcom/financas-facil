'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Transaction } from '@/lib/types'
import { groupByMonth } from '@/lib/utils'
import { useMemo } from 'react'

interface Props { transactions: Transaction[] }

export default function EvolutionChart({ transactions }: Props) {
  const data = useMemo(() => {
    const monthly = groupByMonth(transactions)
    let acc = 0
    return monthly.map(m => { acc += m.income - m.expense; return { ...m, balance: acc } })
  }, [transactions])

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => { const [, m] = v.split('-'); const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return months[parseInt(m) - 1] || v }} />
          <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `R$${Number(v)}`} />
          <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
          <Line type="monotone" dataKey="balance" name="Saldo" stroke="var(--accent, #A855F7)" strokeWidth={2} dot={{ r: 4, fill: 'var(--accent, #A855F7)' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

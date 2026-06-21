'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '@/lib/types'
import { groupByCategory } from '@/lib/utils'
import { useMemo } from 'react'
import { COLORS } from '@/lib/constants'

interface Props { transactions: Transaction[] }

export default function CategoryPieChart({ transactions }: Props) {
  const data = useMemo(() => groupByCategory(transactions), [transactions])
  const total = data.reduce((a, d) => a + d.value, 0)

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4}
            label={({ category, value }) => `${category} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`}>
            {data.map((_, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}
          </Pie>
          <Tooltip formatter={(value: number) => [`R$ ${Number(value).toFixed(2)} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, '']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
          <Legend wrapperStyle={{ color: '#6B7280', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

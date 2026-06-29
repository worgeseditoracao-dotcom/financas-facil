'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '@/lib/types'
import { groupByCategory } from '@/lib/utils'
import { useMemo } from 'react'

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#EF4444', '#3B82F6', '#A855F7', '#14B8A6', '#F97316']

interface Props { transactions: Transaction[] }

export default function CategoryPieChart({ transactions }: Props) {
  const data = useMemo(() => groupByCategory(transactions), [transactions])

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="category"
            cx="50%" cy="50%" innerRadius={55} outerRadius={100}
            paddingAngle={3} strokeWidth={2}
            stroke="#FFFFFF"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
            contentStyle={{
              borderRadius: '16px', border: 'none', background: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '12px 16px',
              fontSize: '13px', color: '#1F2937',
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#6B7280', paddingTop: '8px' }}
            layout="horizontal"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

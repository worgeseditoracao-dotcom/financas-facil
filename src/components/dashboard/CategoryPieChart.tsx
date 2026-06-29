'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Transaction } from '@/lib/types'
import { groupByCategory } from '@/lib/utils'
import { useMemo } from 'react'

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#22C55E', '#EF4444', '#3B82F6', '#A855F7', '#14B8A6', '#F97316']

interface Props { transactions: Transaction[] }

function renderLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 25
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.05) return null
  return (
    <text x={x} y={y} fill="#6B7280" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function CategoryPieChart({ transactions }: Props) {
  const data = useMemo(() => {
    const items = groupByCategory(transactions)
    const total = items.reduce((sum, i) => sum + i.value, 0)
    return items.map(i => ({ ...i, pct: total > 0 ? ((i.value / total) * 100).toFixed(1) + '%' : '0%' }))
  }, [transactions])

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="category"
            cx="50%" cy="45%" innerRadius={55} outerRadius={90}
            paddingAngle={3} strokeWidth={2} stroke="#FFFFFF"
            label={renderLabel}
            labelLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [`R$ ${Number(value).toFixed(2)} (${props.payload.pct})`, name]}
            contentStyle={{
              borderRadius: '16px', border: 'none', background: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '12px 16px',
              fontSize: '13px', color: '#1F2937',
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#6B7280', paddingTop: '16px' }}
            verticalAlign="bottom"
            formatter={(value: string) => <span className="text-zinc-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

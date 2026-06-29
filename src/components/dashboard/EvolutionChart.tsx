'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'
import type { Transaction } from '@/lib/types'
import { groupByMonth } from '@/lib/utils'
import { useMemo } from 'react'

interface Props { transactions: Transaction[] }

export default function EvolutionChart({ transactions }: Props) {
  const data = useMemo(() => {
    const monthly = groupByMonth(transactions)
    let acc = 0
    return monthly.map(m => {
      acc += m.income - m.expense
      return { ...m, balance: acc }
    })
  }, [transactions])

  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Nenhum dado disponível</div>
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="evolutionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.02} />
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
            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Saldo']}
            contentStyle={{
              borderRadius: '16px', border: 'none', background: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '12px 16px',
              fontSize: '13px', color: '#1F2937',
            }}
          />
          <Area type="monotone" dataKey="balance" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#evolutionGrad)" dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6, fill: '#8B5CF6', strokeWidth: 3, stroke: '#FFFFFF' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

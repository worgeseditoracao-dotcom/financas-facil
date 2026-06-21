'use client'

import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
  variant?: 'default' | 'income' | 'expense' | 'savings'
}

export default function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  const colors = {
    default: 'bg-emerald-500/10 text-emerald-500',
    income: 'bg-emerald-500/10 text-emerald-500',
    expense: 'bg-red-500/10 text-red-500',
    savings: 'bg-blue-500/10 text-blue-500',
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500">{title}</span>
        <div className={`rounded-xl p-2 ${colors[variant]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  )
}

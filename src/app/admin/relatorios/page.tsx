'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6']

export default function AdminReports() {
  const [stats, setStats] = useState<any>(null)
  const [view, setView] = useState<'day' | 'month' | 'year'>('month')

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
  }, [])

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500" /></div>

  const data = view === 'day' ? stats.byDay : view === 'month' ? stats.byMonth : stats.byYear
  const labelKey = view === 'day' ? 'date' : view === 'month' ? 'month' : 'year'
  const totalRevenue = data?.reduce((acc: number, d: any) => acc + d.revenue, 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Relatórios</h1>
          <p className="mt-1 text-sm text-zinc-500">Receita total: R$ {totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['day', 'month', 'year'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${view === v ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
            {v === 'day' ? 'Dia' : v === 'month' ? 'Mês' : 'Ano'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700">Vendas por {view === 'day' ? 'Dia' : view === 'month' ? 'Mês' : 'Ano'}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data || []}>
                <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} tickFormatter={v => view === 'month' ? v.substring(5) : v} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, 'Receita']} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700">Evolução de Vendas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data || []}>
                <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} tickFormatter={v => view === 'month' ? v.substring(5) : v} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [v, 'Vendas']} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Quantidade" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">Resumo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-zinc-50">
            <p className="text-2xl font-bold text-zinc-900">{stats.activeUsers}</p>
            <p className="text-xs text-zinc-500">Usuários Ativos</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50">
            <p className="text-2xl font-bold text-zinc-900">{stats.totalPurchases}</p>
            <p className="text-xs text-zinc-500">Total de Vendas</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50">
            <p className="text-2xl font-bold text-emerald-600">R$ {stats.totalRevenue?.toFixed(2)}</p>
            <p className="text-xs text-zinc-500">Receita Total</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50">
            <p className="text-2xl font-bold text-zinc-900">{stats.totalUsers}</p>
            <p className="text-xs text-zinc-500">Total Usuários</p>
          </div>
        </div>
      </div>
    </div>
  )
}

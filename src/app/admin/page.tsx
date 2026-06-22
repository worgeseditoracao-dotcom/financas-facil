'use client'

import { useState, useEffect } from 'react'
import { Users, DollarSign, UserCheck, UserX, MessageSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#8b5cf6', '#f97316']

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
    fetch('/api/admin/stats/messages').then(r => r.json()).then(d => setUnread(d.unread || 0))
  }, [])

  if (!stats) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard title="Total Usuários" value={stats.totalUsers} icon={<Users size={20} />} color="bg-blue-50 text-blue-600" />
        <StatCard title="Ativos" value={stats.activeUsers} icon={<UserCheck size={20} />} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Bloqueados" value={stats.blockedUsers} icon={<UserX size={20} />} color="bg-red-50 text-red-600" />
        <StatCard title="Vendas" value={stats.totalPurchases} icon={<DollarSign size={20} />} color="bg-purple-50 text-purple-600" />
        <StatCard title="Mensagens" value={unread} icon={<MessageSquare size={20} />} color="bg-orange-50 text-orange-600" subtitle="não lidas" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700">Receita por Mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byMonth || []}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={v => v.substring(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, 'Receita']} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700">Receita Diária (30 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.byDay || []}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.substring(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Tooltip formatter={(v: any) => [`R$ ${Number(v).toFixed(2)}`, 'Receita']} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700">Distribuição de Usuários</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[
                { name: 'Ativos', value: stats.activeUsers },
                { name: 'Bloqueados', value: stats.blockedUsers },
                { name: 'Inativos', value: Math.max(0, stats.totalUsers - stats.activeUsers - stats.blockedUsers) },
              ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {[0, 1, 2].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, subtitle }: any) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{title}</span>
        <div className={`rounded-xl p-1.5 ${color}`}>{icon}</div>
      </div>
      <p className="mt-2 text-xl font-bold text-zinc-900">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
    </div>
  )
}

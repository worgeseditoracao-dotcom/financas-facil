'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Plus, Pencil, Trash2, BarChart3, RefreshCw } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency, simulateInvestment } from '@/lib/utils'
import { INVESTMENT_TYPES } from '@/lib/constants'
import type { Investment } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Investments() {
  const { state, addInvestment, updateInvestment, deleteInvestment } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [simulating, setSimulating] = useState<Investment | null>(null)
  const [editing, setEditing] = useState<Investment | null>(null)
  const [tab, setTab] = useState<'personal' | 'business'>('personal')

  const filtered = state.investments.filter(i => i.module === tab)
  const totalInvested = filtered.reduce((a, i) => a + i.initialValue, 0)
  const totalMonthly = filtered.reduce((a, i) => a + i.monthlyContribution, 0)

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Investimentos</h1>
          <p className="mt-1 text-sm text-zinc-500">Simule e acompanhe seus investimentos</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Novo Investimento</Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('personal')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Pessoal</button>
        <button onClick={() => setTab('business')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Negócio (PJ)</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Total Investido</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Contribuição Mensal</span>
          <p className="mt-1 text-lg font-bold text-emerald-500">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Qtd. Investimentos</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Projeção (5 anos)</span>
          <p className="mt-1 text-lg font-bold text-emerald-500">
            {formatCurrency(simulateInvestment(totalInvested, totalMonthly, 0.13, 60)[59]?.value || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(inv => {
          const invType = INVESTMENT_TYPES.find(t => t.value === inv.type)
          const projection = simulateInvestment(inv.initialValue, inv.monthlyContribution, inv.annualRate, 60)
          const finalValue = projection[59]?.value || 0
          const gain = finalValue - (inv.initialValue + inv.monthlyContribution * 60)
          const percentGain = (inv.initialValue + inv.monthlyContribution * 60) > 0 ? ((gain / (inv.initialValue + inv.monthlyContribution * 60)) * 100).toFixed(1) : '0'

          return (
            <div key={inv.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <BarChart3 size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900">{inv.name}</h3>
                    <p className="text-xs text-zinc-500">{invType?.label} · {(inv.annualRate * 100).toFixed(1)}% a.a.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Inicial</span><span className="text-zinc-900">{formatCurrency(inv.initialValue)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Mensal</span><span className="text-zinc-900">{formatCurrency(inv.monthlyContribution)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Projeção 5 anos</span><span className="text-emerald-500">{formatCurrency(finalValue)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Ganho estimado</span><span className="text-emerald-500">+{formatCurrency(gain)} ({percentGain}%)</span></div>
              </div>

              <button onClick={() => setSimulating(inv)} className="w-full text-center text-xs text-emerald-500 hover:text-emerald-400 py-1 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                Ver Simulação Gráfica
              </button>

              <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(inv)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
                <button onClick={() => deleteInvestment(inv.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-500">
            <TrendingUp size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum investimento cadastrado</p>
            <p className="text-sm mt-1">Adicione investimentos e veja simulações de rendimento</p>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <InvestmentForm
          investment={editing}
          onSave={(data) => { editing ? (updateInvestment({ ...editing, ...data }), setEditing(null)) : (addInvestment(data), setShowForm(false)) }}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {simulating && <InvestmentSimulation investment={simulating} onClose={() => setSimulating(null)} />}

      <QuickSimulator />
    </div>
  )
}

function QuickSimulator() {
  const [initial, setInitial] = useState('10000')
  const [monthly, setMonthly] = useState('500')
  const [rate, setRate] = useState('13')
  const [years, setYears] = useState(10)

  const data = useMemo(() => {
    const v = simulateInvestment(parseFloat(initial) || 0, parseFloat(monthly) || 0, (parseFloat(rate) || 0) / 100, years * 12)
    return v.map(d => ({ ...d, month: `M${d.month}` }))
  }, [initial, monthly, rate, years])

  const last = data[data.length - 1]
  const totalInv = (parseFloat(initial) || 0) + (parseFloat(monthly) || 0) * years * 12
  const gain = last ? last.value - totalInv : 0
  const percentGain = totalInv > 0 ? ((gain / totalInv) * 100).toFixed(1) : '0'

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw size={18} className="text-emerald-500" />
        <h2 className="text-base font-semibold text-zinc-900">Simulador Rápido</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-4">
        <Input label="Valor Inicial (R$)" type="number" value={initial} onChange={e => setInitial(e.target.value)} />
        <Input label="Aporte Mensal (R$)" type="number" value={monthly} onChange={e => setMonthly(e.target.value)} />
        <div>
          <label className="text-sm font-medium text-zinc-500 block mb-1.5">Taxa Anual (%)</label>
          <div className="flex gap-1 flex-wrap">
            {[{ v: '6', l: '6%' }, { v: '8', l: '8%' }, { v: '10', l: '10%' }, { v: '13', l: '13%' }, { v: '15', l: '15%' }].map(r => (
              <button key={r.v} type="button" onClick={() => setRate(r.v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${rate === r.v ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{r.l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-500 block mb-1.5">Período</label>
          <select value={years} onChange={e => setYears(Number(e.target.value))}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
            {[1, 3, 5, 10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} {y === 1 ? 'ano' : 'anos'}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="rounded-xl bg-emerald-500/5 p-3"><span className="text-zinc-500 text-xs">Valor Final</span><p className="font-bold text-emerald-500">{formatCurrency(last?.value || 0)}</p></div>
        <div className="rounded-xl bg-zinc-100 p-3"><span className="text-zinc-500 text-xs">Total Investido</span><p className="font-bold text-zinc-900">{formatCurrency(totalInv)}</p></div>
        <div className="rounded-xl bg-emerald-500/5 p-3"><span className="text-zinc-500 text-xs">Rendimento</span><p className="font-bold text-emerald-500">+{formatCurrency(gain)}</p></div>
        <div className="rounded-xl bg-emerald-500/5 p-3"><span className="text-zinc-500 text-xs">Retorno</span><p className="font-bold text-emerald-500">{percentGain}%</p></div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="simGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent, #A855F7)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--accent, #A855F7)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} interval={Math.ceil(data.length / 8)} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => `R$${Math.round(v/1000)}k`} />
            <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
            <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="url(#simGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function InvestmentForm({ investment, onSave, onClose }: {
  investment?: Investment | null
  onSave: (data: Omit<Investment, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(investment?.name || '')
  const [type, setType] = useState(investment?.type || 'cdb')
  const [initialValue, setInitialValue] = useState(investment ? String(investment.initialValue) : '')
  const [monthlyContribution, setMonthlyContribution] = useState(investment ? String(investment.monthlyContribution) : '')
  const [annualRate, setAnnualRate] = useState(investment ? String(investment.annualRate * 100) : '')
  const [deadline, setDeadline] = useState(investment?.deadline || '')
  const [module, setModule] = useState<'personal' | 'business'>(investment?.module || 'personal')

  const invType = INVESTMENT_TYPES.find(t => t.value === type)
  const suggestedRate = invType?.rate

  return (
    <Modal title={investment ? 'Editar Investimento' : 'Novo Investimento'} onClose={onClose} open>
      <form onSubmit={(e) => { e.preventDefault(); if (!name || !initialValue) return;
        onSave({ name: name.trim(), type: type as any, initialValue: Math.abs(parseFloat(initialValue)), monthlyContribution: Math.abs(parseFloat(monthlyContribution) || 0), annualRate: (parseFloat(annualRate) || suggestedRate || 0.13) / 100, startDate: new Date().toISOString().split('T')[0], deadline: deadline || undefined, module })
      }} className="space-y-4">
        <Input label="Nome" placeholder="Ex: CDB Banco X" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Tipo</label>
          <select value={type} onChange={e => { setType(e.target.value); setAnnualRate(String((INVESTMENT_TYPES.find(t => t.value === e.target.value)?.rate || 0.13) * 100)) }}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/30">
            {INVESTMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} ({(t.rate * 100).toFixed(1)}% a.a.)</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input label="Valor Inicial (R$)" type="number" step="0.01" placeholder="1000" value={initialValue} onChange={e => setInitialValue(e.target.value)} required />
          </div>
          <div className="flex-1">
            <Input label="Aporte Mensal" type="number" step="0.01" placeholder="200" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} />
          </div>
        </div>
        <Input label="Taxa Anual (% a.a.)" type="number" step="0.1" placeholder="13.0" value={annualRate} onChange={e => setAnnualRate(e.target.value)} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{investment ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function InvestmentSimulation({ investment, onClose }: { investment: Investment; onClose: () => void }) {
  const [years, setYears] = useState(5)

  const data = useMemo(() => {
    const months = years * 12
    const projection = simulateInvestment(investment.initialValue, investment.monthlyContribution, investment.annualRate, months)
    return projection.map(d => ({ ...d, month: `M${d.month}` }))
  }, [investment, years])

  const last = data[data.length - 1]
  const totalContributed = investment.initialValue + investment.monthlyContribution * (years * 12)
  const gain = last ? last.value - totalContributed : 0
  const pct = totalContributed > 0 ? ((gain / totalContributed) * 100).toFixed(1) : '0'

  return (
    <Modal title={`Simulação: ${investment.name}`} onClose={onClose} open>
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 3, 5, 10, 20, 30].map(y => (
            <button key={y} onClick={() => setYears(y)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${years === y ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{y} {y === 1 ? 'ano' : 'anos'}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-emerald-500/5 p-2"><span className="text-zinc-500 text-xs">Valor Final</span><p className="font-bold text-emerald-500">{formatCurrency(last?.value || 0)}</p></div>
          <div className="rounded-lg bg-zinc-100 p-2"><span className="text-zinc-500 text-xs">Total Investido</span><p className="font-bold text-zinc-900">{formatCurrency(totalContributed)}</p></div>
          <div className="rounded-lg bg-emerald-500/5 p-2"><span className="text-zinc-500 text-xs">Rendimento</span><p className="font-bold text-emerald-500">+{formatCurrency(gain)}</p></div>
          <div className="rounded-lg bg-emerald-500/5 p-2"><span className="text-zinc-500 text-xs">Retorno</span><p className="font-bold text-emerald-500">{pct}%</p></div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent, #A855F7)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent, #A855F7)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} interval={Math.ceil(data.length / 10)} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={v => `R$${Math.round(v/1000)}k`} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', color: '#1A1A2E' }} />
              <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-zinc-500 text-center">
          Taxa: {(investment.annualRate * 100).toFixed(1)}% a.a. · Aporte mensal: {formatCurrency(investment.monthlyContribution)}
        </div>
      </div>
    </Modal>
  )
}

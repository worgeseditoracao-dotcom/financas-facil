'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Target, Plane, ShoppingBag, PiggyBank, GraduationCap, AlertCircle, ArrowRight, TrendingUp, CalendarDays, FileText, Upload } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import type { Goal } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const goalTypes = [
  { value: 'generic', label: 'Genérica', icon: Target },
  { value: 'travel', label: 'Viagem', icon: Plane },
  { value: 'purchase', label: 'Compra', icon: ShoppingBag },
  { value: 'emergency', label: 'Reserva Emergência', icon: PiggyBank },
  { value: 'education', label: 'Estudos', icon: GraduationCap },
  { value: 'investment', label: 'Investimento', icon: TrendingUp },
]

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Goals() {
  const { state, addGoal, updateGoal, deleteGoal } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [tab, setTab] = useState<'personal' | 'business'>('personal')
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [addAmount, setAddAmount] = useState<Record<string, string>>({})

  const handleAddToGoal = (goalId: string) => {
    const amount = parseFloat(addAmount[goalId] || '0')
    if (amount <= 0) return
    const goal = state.goals.find(g => g.id === goalId)
    if (!goal) return
    updateGoal({ ...goal, currentValue: goal.currentValue + amount })
    setAddAmount(prev => ({ ...prev, [goalId]: '' }))
  }

  const filtered = state.goals.filter(g => g.module === tab)
  const totalTarget = filtered.reduce((a, g) => a + g.targetValue, 0)
  const totalCurrent = filtered.reduce((a, g) => a + g.currentValue, 0)
  const completedGoals = filtered.filter(g => g.currentValue >= g.targetValue).length

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay()
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const billsInMonth = state.bills.filter(b => {
      const d = new Date(b.dueDate)
      return d.getMonth() === calMonth && d.getFullYear() === calYear && !b.paid
    })
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayBills = billsInMonth.filter(b => b.dueDate === dateStr)
      days.push({ day: d, bills: dayBills })
    }
    return days
  }, [calMonth, calYear, state.bills])

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Metas Financeiras</h1>
          <p className="mt-1 text-sm text-zinc-500">Defina objetivos e saiba quanto guardar por mês</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Nova Meta</Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('personal')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Pessoal</button>
        <button onClick={() => setTab('business')} className={`rounded-xl px-4 py-2 text-sm font-medium ${tab === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Negócio (PJ)</button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Total de Metas</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{filtered.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Concluídas</span>
          <p className="mt-1 text-lg font-bold text-emerald-500">{completedGoals}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Valor Total</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCurrency(totalTarget)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Já Guardado</span>
          <p className="mt-1 text-lg font-bold text-emerald-500">{formatCurrency(totalCurrent)}</p>
        </div>
      </div>

      {/* Calendário de Contas */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">{MONTHS[calMonth]} {calYear}</h2>
          </div>
          <div className="flex gap-1">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) } else setCalMonth(calMonth - 1) }} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100">←</button>
            <button onClick={() => { const n = new Date(); setCalMonth(n.getMonth()); setCalYear(n.getFullYear()) }} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100">Hoje</button>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) } else setCalMonth(calMonth + 1) }} className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100">→</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500 mb-2">
          {WEEKDAYS.map(d => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div key={i} className="min-h-[60px] rounded-lg border border-zinc-100 p-1">
              {day && (
                <>
                  <span className={`text-xs font-medium ${day.bills.length > 0 ? 'text-red-500' : 'text-zinc-900'}`}>{day.day}</span>
                  {day.bills.length > 0 && (
                    <div className="mt-0.5 space-y-0.5">
                      {day.bills.slice(0, 2).map(b => (
                        <div key={b.id} className="flex items-center gap-0.5 text-[8px] leading-tight text-red-500 bg-red-500/5 rounded px-0.5">
                          <FileText size={6} />
                          <span className="truncate">{b.name}</span>
                        </div>
                      ))}
                      {day.bills.length > 2 && <span className="text-[8px] text-zinc-400">+{day.bills.length - 2}</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(goal => {
          const progress = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
          const remaining = goal.targetValue - goal.currentValue
          const GoalIcon = goalTypes.find(t => t.value === (goal.goalType || goal.type))?.icon || Target

          let monthsLeft = 0
          if (goal.deadline) {
            const deadline = new Date(goal.deadline)
            const now = new Date()
            monthsLeft = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
          }
          const monthlyNeed = goal.monthlySavingSuggest || (remaining > 0 && monthsLeft > 0 ? remaining / monthsLeft : 0)

          return (
            <div key={goal.id} className="rounded-2xl border border-zinc-200 bg-white p-5 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <GoalIcon size={20} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 truncate">{goal.name}</h3>
                  <p className="text-xs text-zinc-500">{goalTypes.find(t => t.value === (goal.goalType || goal.type))?.label}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Progresso</span>
                  <span className="text-zinc-900 font-medium">{progress}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.max(2, progress)}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500">{formatCurrency(goal.currentValue)}</span>
                  <span className="text-zinc-500">{formatCurrency(goal.targetValue)}</span>
                </div>
              </div>

              {remaining > 0 && (
                <div className="mt-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    <ArrowRight size={12} className="text-emerald-500" />
                    <span>Faltam {formatCurrency(remaining)}</span>
                  </div>
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-xs text-emerald-500">
                      <AlertCircle size={12} />
                      <span>Guarde {formatCurrency(Math.round(monthlyNeed))}/mês até {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
                  <input
                    type="number" step="0.01" placeholder="Guardar..."
                    value={addAmount[goal.id] || ''}
                    onChange={e => setAddAmount(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddToGoal(goal.id) }}
                    className="w-full h-9 rounded-xl border border-zinc-200 pl-8 pr-3 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleAddToGoal(goal.id)}
                  disabled={!addAmount[goal.id] || parseFloat(addAmount[goal.id]) <= 0}
                  className="shrink-0 h-9 px-3 rounded-xl bg-emerald-500 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors">
                  <Upload size={14} className="inline mr-1" />Guardar
                </button>
              </div>

              <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(goal)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
                <button onClick={() => deleteGoal(goal.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-500">
            <Target size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhuma meta cadastrada</p>
            <p className="text-sm mt-1">Crie metas para viagem, reserva de emergência, compras, estudos...</p>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <GoalForm
          goal={editing}
          onSave={(data) => { editing ? (updateGoal({ ...editing, ...data }), setEditing(null)) : (addGoal(data), setShowForm(false)) }}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function GoalForm({ goal, onSave, onClose }: {
  goal?: Goal | null
  onSave: (data: Omit<Goal, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(goal?.name || '')
  const [description, setDescription] = useState(goal?.description || '')
  const [type, setType] = useState(goal?.goalType || goal?.type || 'generic')
  const [targetValue, setTargetValue] = useState(goal ? String(goal.targetValue) : '')
  const [currentValue, setCurrentValue] = useState(goal ? String(goal.currentValue) : '0')
  const [deadline, setDeadline] = useState(goal?.deadline || '')
  const [monthlySaving, setMonthlySaving] = useState(goal?.monthlySaving ? String(goal.monthlySaving) : '')
  const [module, setModule] = useState<'personal' | 'business'>(goal?.module || 'personal')

  const remaining = (parseFloat(targetValue) || 0) - (parseFloat(currentValue) || 0)
  let monthsLeft = 0
  if (deadline) {
    const d = new Date(deadline)
    const n = new Date()
    monthsLeft = (d.getFullYear() - n.getFullYear()) * 12 + (d.getMonth() - n.getMonth())
  }
  const savingSuggest = remaining > 0 && monthsLeft > 0 ? Math.round(remaining / monthsLeft) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !targetValue) return
    onSave({
      name: name.trim(), description: description.trim() || undefined,
      targetValue: Math.abs(parseFloat(targetValue)), currentValue: Math.abs(parseFloat(currentValue) || 0),
      deadline: deadline || undefined, category: type, goalType: (type || 'generic') as Goal['goalType'],
      monthlySaving: parseFloat(monthlySaving) || undefined,
      monthlySavingSuggest: savingSuggest || undefined,
      module,
    })
  }

  return (
    <Modal title={goal ? 'Editar Meta' : 'Nova Meta'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome da Meta" placeholder="Ex: Viagem para Europa" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <Input label="Descrição" placeholder="Descrição opcional" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Tipo de Objetivo</label>
          <div className="flex flex-wrap gap-2">
            {goalTypes.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setType(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${type === value ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        <div className="flex gap-2">
          <Input label="Valor da Meta (R$)" type="number" step="0.01" placeholder="10000" value={targetValue} onChange={e => setTargetValue(e.target.value)} required />
          <Input label="Já Guardado (R$)" type="number" step="0.01" placeholder="0" value={currentValue} onChange={e => setCurrentValue(e.target.value)} />
        </div>
        <Input label="Prazo (opcional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        {deadline && monthsLeft > 0 && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm">
            <p className="text-emerald-500 font-medium">Sugestão: guarde <strong>{formatCurrency(savingSuggest)}/mês</strong></p>
            <p className="text-xs text-zinc-500 mt-1">{monthsLeft} meses para atingir a meta</p>
          </div>
        )}
        <Input label="Quanto quer guardar por mês (R$)" type="number" step="0.01" placeholder={String(savingSuggest || '')} value={monthlySaving} onChange={e => setMonthlySaving(e.target.value)} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{goal ? 'Salvar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

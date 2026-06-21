'use client'

import { useState } from 'react'
import type { Transaction } from '@/lib/types'
import { useStore } from '@/lib/store'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface Props {
  type: 'income' | 'expense' | null
  onClose: () => void
}

export default function QuickTransactionModal({ type, onClose }: Props) {
  const { state, addTransaction } = useStore()
  const [value, setValue] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [module, setModule] = useState<'personal' | 'business'>('personal')
  const [clientId, setClientId] = useState('')

  if (!type) return null

  const categories = module === 'personal' ? state.personalCategories : state.businessCategories

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value || !category || !description || !date) return
    const numValue = Math.abs(parseFloat(value))
    if (isNaN(numValue)) return
    addTransaction({ date, category, description, value: type === 'income' ? numValue : -numValue, type, module, clientId: clientId || undefined })
    setValue(''); setCategory(''); setDescription(''); setClientId(''); onClose()
  }

  return (
    <Modal title={type === 'income' ? 'Nova Receita' : 'Nova Despesa'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        <Input label="Valor" type="number" step="0.01" placeholder="0,00" value={value} onChange={e => setValue(e.target.value)} required autoFocus />
        <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)}
          options={[{ value: '', label: 'Selecione...' }, ...categories.map(c => ({ value: c.name, label: c.name }))]} required />
        <Input label="Descrição" placeholder="Descrição da transação" value={description} onChange={e => setDescription(e.target.value)} required />
        <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        {module === 'business' && state.clients.length > 0 && (
          <Select label="Cliente (opcional)" value={clientId} onChange={e => setClientId(e.target.value)}
            options={[{ value: '', label: 'Sem cliente' }, ...state.clients.map(c => ({ value: c.id, label: c.name }))]} />
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">Adicionar</Button>
        </div>
      </form>
    </Modal>
  )
}
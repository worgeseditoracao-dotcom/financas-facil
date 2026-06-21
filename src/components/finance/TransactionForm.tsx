'use client'

import { useState } from 'react'
import type { Transaction, Category } from '@/lib/types'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface Props {
  transaction?: Transaction
  categories: Category[]
  module: 'personal' | 'business'
  clients?: { id: string; name: string }[]
  onSave: (transaction: Transaction) => void
  onClose: () => void
}

export default function TransactionForm({ transaction, categories, module, onSave, onClose, clients }: Props) {
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState(transaction?.category || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [value, setValue] = useState(transaction ? String(Math.abs(transaction.value)) : '')
  const [type, setType] = useState(transaction?.type || 'expense')
  const [clientId, setClientId] = useState(transaction?.clientId || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !category || !description || !value) return
    const numValue = Math.abs(parseFloat(value))
    if (isNaN(numValue)) return
    onSave({
      id: transaction?.id || '',
      date, category, description,
      value: type === 'income' ? numValue : -numValue,
      type: type as 'income' | 'expense',
      module,
      clientId: clientId || undefined,
      createdAt: transaction?.createdAt || new Date().toISOString(),
    })
  }

  return (
    <Modal title={transaction ? 'Editar Transação' : 'Nova Transação'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Tipo" value={type} onChange={e => setType(e.target.value as 'income' | 'expense')}
          options={[{ value: 'expense', label: 'Despesa' }, { value: 'income', label: 'Receita' }]} />
        <Input label="Valor" type="number" step="0.01" placeholder="0,00" value={value} onChange={e => setValue(e.target.value)} required />
        <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)}
          options={[{ value: '', label: 'Selecione...' }, ...categories.map(c => ({ value: c.name, label: c.name }))]} required />
        <Input label="Descrição" placeholder="Descrição da transação" value={description} onChange={e => setDescription(e.target.value)} required />
        <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        {module === 'business' && clients && clients.length > 0 && (
          <Select label="Cliente (opcional)" value={clientId} onChange={e => setClientId(e.target.value)}
            options={[{ value: '', label: 'Sem cliente' }, ...clients.map(c => ({ value: c.id, label: c.name }))]} />
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{transaction ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
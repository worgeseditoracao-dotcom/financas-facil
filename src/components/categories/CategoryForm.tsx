'use client'

import { useState } from 'react'
import type { Category } from '@/lib/types'
import { COLORS } from '@/lib/constants'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

interface Props {
  category?: Category
  module: 'personal' | 'business'
  onSave: (data: { name: string; color: string; icon: string; module: 'personal' | 'business' }) => void
  onClose: () => void
}

const ICONS = [
  { value: 'trending-up', label: '↑ Tendência' },
  { value: 'megaphone', label: '📢 Megafone' },
  { value: 'wrench', label: '🔧 Ferramenta' },
  { value: 'landmark', label: '🏛️ Banco' },
  { value: 'settings', label: '⚙️ Config' },
  { value: 'briefcase', label: '💼 Negócio' },
  { value: 'utensils-crossed', label: '🍽️ Alimentação' },
  { value: 'car', label: '🚗 Carro' },
  { value: 'heart-pulse', label: '❤️ Saúde' },
  { value: 'book-open', label: '📖 Educação' },
  { value: 'gamepad-2', label: '🎮 Lazer' },
  { value: 'home', label: '🏠 Casa' },
  { value: 'shopping-cart', label: '🛒 Compras' },
  { value: 'dollar-sign', label: '💰 Dinheiro' },
  { value: 'credit-card', label: '💳 Cartão' },
]

export default function CategoryForm({ category, module, onSave, onClose }: Props) {
  const [name, setName] = useState(category?.name || '')
  const [color, setColor] = useState(category?.color || COLORS[0])
  const [icon, setIcon] = useState(category?.icon || ICONS[0].value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color, icon, module })
  }

  return (
    <Modal title={category ? 'Editar Categoria' : 'Nova Categoria'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" placeholder="Nome da categoria" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Cor</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <Select label="Ícone" value={icon} onChange={e => setIcon(e.target.value)} options={ICONS} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{category ? 'Salvar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
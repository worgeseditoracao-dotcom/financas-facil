'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Category } from '@/lib/types'
import CategoryForm from '@/components/categories/CategoryForm'
import Button from '@/components/ui/Button'

function CategoryCard({ category, onEdit, onDelete }: { category: Category; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 group">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: category.color + '20' }}>
        <div className="h-5 w-5 rounded-full" style={{ backgroundColor: category.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{category.name}</p>
        <p className="text-xs text-zinc-500">{category.module === 'personal' ? 'Pessoal' : 'Negócio'}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Categories() {
  const { state, addCategory, updateCategory, deleteCategory } = useStore()
  const [tab, setTab] = useState<'personal' | 'business'>('personal')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const categories = tab === 'personal' ? state.personalCategories : state.businessCategories

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Categorias</h1>
          <p className="mt-1 text-sm text-zinc-500">Gerencie suas categorias personalizadas</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Nova Categoria</Button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('personal')} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Pessoal</button>
        <button onClick={() => setTab('business')} className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>Negócio</button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map(cat => (
          <CategoryCard key={cat.id} category={cat} onEdit={() => setEditing(cat)} onDelete={() => deleteCategory(cat.id)} />
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-500">Nenhuma categoria encontrada</div>
        )}
      </div>

      {showForm && (
        <CategoryForm module={tab} onSave={(data) => { addCategory(data); setShowForm(false) }} onClose={() => setShowForm(false)} />
      )}
      {editing && (
        <CategoryForm category={editing} module={editing.module} onSave={(data) => { updateCategory({ ...editing, ...data }); setEditing(null) }} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
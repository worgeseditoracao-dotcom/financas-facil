'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2, Phone, Mail, FileText } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { Supplier } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Suppliers() {
  const { state, addSupplier, updateSupplier, deleteSupplier } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)

  const { suppliers, bills } = state
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fornecedores</h1>
          <p className="mt-1 text-sm text-zinc-500">Gerencie seus fornecedores e histórico de pagamentos</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Novo Fornecedor</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Total Fornecedores</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{suppliers.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Contas Vinculadas</span>
          <p className="mt-1 text-lg font-bold text-blue-500">{bills.filter(b => b.supplierId).length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Total Pendente</span>
          <p className="mt-1 text-lg font-bold text-red-500">
            {bills.filter(b => b.supplierId && !b.paid && b.dueDate < today).length} atrasada(s)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {suppliers.map(supplier => {
          const supplierBills = bills.filter(b => b.supplierId === supplier.id)
          const totalBilled = supplierBills.reduce((a, b) => a + b.value, 0)
          const unpaidBills = supplierBills.filter(b => !b.paid)
          const overdueBills = unpaidBills.filter(b => b.dueDate < today)

          return (
            <div key={supplier.id} className="rounded-2xl border border-zinc-200 bg-white p-4 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Building2 size={20} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900">{supplier.name}</h3>
                    <p className="text-xs text-zinc-500">{supplier.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {supplier.phone && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><Phone size={10} />{supplier.phone}</span>
                  )}
                  {supplier.email && (
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><Mail size={10} />{supplier.email}</span>
                  )}
                  <button onClick={() => { setEditing(supplier); setShowForm(true) }} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
                  <button onClick={() => deleteSupplier(supplier.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>

              {supplierBills.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-200">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-500">Total faturado: <strong className="text-zinc-900">{totalBilled}</strong></span>
                    <span className="text-zinc-500">Pendentes: <strong className={unpaidBills.length > 0 ? 'text-red-500' : 'text-emerald-500'}>{unpaidBills.length}</strong></span>
                    {overdueBills.length > 0 && (
                      <span className="text-red-500 font-medium">{overdueBills.length} atrasada(s)</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                    {supplierBills.slice(0, 3).map(b => (
                      <div key={b.id} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-zinc-500">{b.name}</span>
                        <span className={b.paid ? 'text-emerald-500' : b.dueDate < today ? 'text-red-500' : 'text-zinc-900'}>
                          {b.paid ? 'Pago' : b.dueDate < today ? 'Atrasado' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                    {supplierBills.length > 3 && (
                      <p className="text-[10px] text-zinc-400">+{supplierBills.length - 3} contas</p>
                    )}
                  </div>
                </div>
              )}

              {supplierBills.length === 0 && (
                <p className="mt-2 text-xs text-zinc-400 italic">Nenhuma conta vinculada ainda</p>
              )}
            </div>
          )
        })}
        {suppliers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <Building2 size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum fornecedor cadastrado</p>
            <p className="text-sm mt-1">Adicione fornecedores e vincule às contas a pagar</p>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <SupplierForm supplier={editing}
          onSave={(data) => { editing ? (updateSupplier({ ...editing, ...data }), setEditing(null)) : (addSupplier(data), setShowForm(false)) }}
          onClose={() => { setShowForm(false); setEditing(null) }} />
      )}
    </div>
  )
}

function SupplierForm({ supplier, onSave, onClose }: {
  supplier?: Supplier | null
  onSave: (data: Omit<Supplier, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(supplier?.name || '')
  const [phone, setPhone] = useState(supplier?.phone || '')
  const [email, setEmail] = useState(supplier?.email || '')
  const [category, setCategory] = useState(supplier?.category || 'Serviços')
  const [document, setDocument] = useState(supplier?.document || '')
  const [notes, setNotes] = useState(supplier?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onSave({
      name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined,
      category, document: document.trim() || undefined, notes: notes.trim() || undefined,
    })
  }

  return (
    <Modal title={supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome / Empresa" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex gap-2">
          <Input label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1" />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
              {['Serviços', 'Produtos', 'Tecnologia', 'Marketing', 'Consultoria', 'Matéria-prima', 'Logística', 'Outros'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input label="CNPJ/CPF" value={document} onChange={e => setDocument(e.target.value)} className="flex-1" />
        </div>
        <Input label="Observações" value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{supplier ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

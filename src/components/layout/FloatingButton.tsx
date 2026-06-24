'use client'

import { Plus, ArrowUpRight, ArrowDownRight, X } from 'lucide-react'
import { useState } from 'react'
import QuickTransactionModal from '@/components/finance/QuickTransactionModal'

export default function FloatingButton() {
  const [open, setOpen] = useState(false)
  const [modalType, setModalType] = useState<'income' | 'expense' | null>(null)

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
        {open && (
          <div className="flex flex-col gap-2 animate-in">
            <button onClick={() => { setModalType('income'); setOpen(false) }}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black shadow-lg hover:bg-emerald-600">
              <ArrowUpRight size={18} /> Nova Receita
            </button>
            <button onClick={() => { setModalType('expense'); setOpen(false) }}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-red-600">
              <ArrowDownRight size={18} /> Nova Despesa
            </button>
          </div>
        )}
        <button onClick={() => setOpen(!open)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg hover:bg-emerald-600 transition-transform accent-glow">
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
      <QuickTransactionModal type={modalType} onClose={() => setModalType(null)} />
    </>
  )
}
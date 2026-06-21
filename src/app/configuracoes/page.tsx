'use client'

import { useStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Download, Trash2, Palette } from 'lucide-react'
import { exportToExcel, exportToPDF, exportToCSV } from '@/lib/export'
import { ACCENT_COLORS } from '@/lib/constants'

export default function Settings() {
  const { state, deleteTransaction, updateSettings } = useStore()

  const handleExportAll = () => exportToExcel(state.transactions, 'financas-facil-completo')
  const handleExportPDF = () => exportToPDF(state.transactions, 'financas-facil-completo')
  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      for (const t of state.transactions) deleteTransaction(t.id)
    }
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Configurações</h1>
        <p className="mt-1 text-sm text-zinc-500">Personalize sua experiência</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900 mb-2">Perfil</h2>
        <Input label="Seu Nome" placeholder="Seu nome" value={state.settings.name}
          onChange={e => updateSettings({ name: e.target.value })} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Palette size={18} className="text-emerald-400" />
          Personalizar Cor do Tema
        </h2>
        <p className="text-sm text-zinc-500 mb-4">Escolha a cor principal do sistema</p>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map(color => (
            <button key={color.value} onClick={() => updateSettings({ accentColor: color.value })}
              className={`h-12 w-12 rounded-xl transition-all ${state.settings.accentColor === color.value ? 'ring-2 ring-white scale-110 ring-offset-2 ring-offset-zinc-50' : 'hover:scale-105'}`}
              style={{ backgroundColor: color.value }}>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-zinc-500">Cor atual:</span>
          <div className="h-6 w-6 rounded-lg" style={{ backgroundColor: state.settings.accentColor }} />
          <span className="text-sm text-zinc-900 font-mono">{state.settings.accentColor}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900 mb-2">Moeda</h2>
        <div className="flex gap-2">
          {[{ value: 'BRL', label: 'R$ Real' }, { value: 'USD', label: '$ Dólar' }, { value: 'EUR', label: '€ Euro' }].map(m => (
            <button key={m.value} onClick={() => updateSettings({ currency: m.value as any })}
              className={`flex-1 rounded-xl py-2 text-sm font-medium ${state.settings.currency === m.value ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{m.label}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900">Exportar Dados</h2>
        <p className="mt-1 text-sm text-zinc-500">Exporte suas transações para Excel ou PDF</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportAll}><Download size={16} /> Excel</Button>
          <Button variant="secondary" onClick={handleExportPDF}><Download size={16} /> PDF</Button>
          <Button variant="secondary" onClick={() => exportToCSV(state.transactions)}><Download size={16} /> CSV</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-red-400/30 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-red-400">Zona de Perigo</h2>
        <p className="mt-1 text-sm text-zinc-500">Ações irreversíveis</p>
        <div className="mt-4">
          <Button variant="danger" onClick={handleClearData}><Trash2 size={16} /> Limpar Todos os Dados</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <h2 className="text-base font-semibold text-zinc-900">Sobre</h2>
        <div className="mt-3 space-y-1 text-sm text-zinc-500">
          <p>Finanças Fácil v2.0.0</p>
          <p>Sistema de gestão financeira completo</p>
          <p>Pessoal e Empresarial</p>
          <p className="mt-2 text-xs">{state.transactions.length} transações · {state.bankAccounts.length} contas · {state.creditCards.length} cartões · {state.investments.length} investimentos · {state.goals.length} metas</p>
        </div>
      </div>
    </div>
  )
}
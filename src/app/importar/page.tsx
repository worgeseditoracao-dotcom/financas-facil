'use client'

import { useState } from 'react'
import { Upload, Download, FileText, Check, AlertTriangle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import * as XLSX from 'xlsx'
import { v4 as uuid } from 'uuid'

export default function ImportPage() {
  const { state, addTransaction, addBill, addReceivable } = useStore()
  const [results, setResults] = useState<{ ok: number; errors: number; messages: string[] } | null>(null)
  const [importType, setImportType] = useState<'transactions' | 'bills' | 'receivables'>('transactions')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(sheet)

      let ok = 0
      let errors = 0
      const messages: string[] = []

      for (const row of rows) {
        try {
          if (importType === 'transactions') {
            const value = parseFloat(row.valor || row.value || '0')
            if (!value || !row.data) { errors++; continue }
            addTransaction({
              date: formatDate(row.data || row.date),
              category: row.categoria || row.category || 'Outros',
              description: row.descricao || row.desc || 'Importado',
              value: row.tipo === 'receita' || row.type === 'income' ? Math.abs(value) : -Math.abs(value),
              type: row.tipo === 'receita' || row.type === 'income' ? 'income' : 'expense',
              module: row.modulo === 'business' ? 'business' : 'personal',
            })
            ok++
          } else if (importType === 'bills') {
            const value = parseFloat(row.valor || row.value || '0')
            if (!value || !row.vencimento) { errors++; continue }
            addBill({
              name: row.nome || row.name || 'Importado',
              value: Math.abs(value),
              dueDate: formatDate(row.vencimento || row.dueDate),
              category: row.categoria || row.category || 'Outros',
              paid: row.pago === 'sim' || row.paid === true,
              recurring: row.recorrente === 'sim' || row.recurring === true,
              module: row.modulo === 'business' ? 'business' : 'personal',
              type: 'bill',
            })
            ok++
          } else {
            const value = parseFloat(row.valor || row.value || '0')
            if (!value || !row.vencimento) { errors++; continue }
            addReceivable({
              name: row.nome || row.name || 'Importado',
              value: Math.abs(value),
              dueDate: formatDate(row.vencimento || row.dueDate),
              category: row.categoria || row.category || 'Outros',
              received: row.recebido === 'sim' || row.received === true,
              recurring: row.recorrente === 'sim' || row.recurring === true,
              module: row.modulo === 'business' ? 'business' : 'personal',
              type: 'receivable',
            })
            ok++
          }
        } catch {
          errors++
        }
      }

      setResults({ ok, errors, messages })
    } catch (err: any) {
      setResults({ ok: 0, errors: 1, messages: [err.message || 'Erro ao ler arquivo'] })
    }
  }

  const downloadTemplate = () => {
    const template = [
      { data: '2026-01-15', categoria: 'Alimentação', descricao: 'Mercado', valor: 350.00, tipo: 'despesa', modulo: 'personal' },
      { data: '2026-01-20', categoria: 'Salário', descricao: 'Empresa', valor: 5000.00, tipo: 'receita', modulo: 'personal' },
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, `template-importacao-${importType}.xlsx`)
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Importar Dados</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Importe transações, contas ou recebimentos em massa via Excel/CSV</p>
      </div>

      <div className="flex gap-2">
        {(['transactions', 'bills', 'receivables'] as const).map(t => (
          <button key={t} onClick={() => setImportType(t)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${importType === t ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
            {t === 'transactions' ? 'Transações' : t === 'bills' ? 'Contas a Pagar' : 'A Receber'}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Upload size={28} className="text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Arraste ou clique para importar</p>
            <p className="text-xs text-zinc-400 mt-1">Formatos: XLSX, XLS, CSV</p>
          </div>
          <label className="cursor-pointer rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-600">
            Selecionar Arquivo
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
          </label>
          <button onClick={downloadTemplate} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-500">
            <Download size={12} /> Baixar template {importType === 'transactions' ? 'de transações' : importType === 'bills' ? 'de contas' : 'de recebimentos'}
          </button>
        </div>
      </div>

      {results && (
        <div className={`rounded-2xl border p-5 ${results.errors > 0 ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {results.errors === 0 ? <Check size={20} className="text-emerald-500" /> : <AlertTriangle size={20} className="text-amber-500" />}
            <p className="font-medium">{results.ok} importado(s) com sucesso{results.errors > 0 ? ` · ${results.errors} erro(s)` : ''}</p>
          </div>
          {results.messages.map((m, i) => <p key={i} className="text-xs text-zinc-600 mt-1">{m}</p>)}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Colunas esperadas no arquivo:</h3>
        <div className="text-xs text-zinc-500 space-y-1 font-mono bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl">
          {importType === 'transactions' && <><p>data | categoria | descricao | valor | tipo | modulo</p><p className="text-zinc-400 mt-1">tipo: "receita" ou "despesa" · modulo: "personal" ou "business"</p></>}
          {importType === 'bills' && <><p>nome | valor | vencimento | categoria | pago | recorrente | modulo</p><p className="text-zinc-400 mt-1">pago: "sim" ou "nao" · recorrente: "sim" ou "nao"</p></>}
          {importType === 'receivables' && <><p>nome | valor | vencimento | categoria | recebido | recorrente | modulo</p><p className="text-zinc-400 mt-1">recebido: "sim" ou "nao"</p></>}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0]
  const cleaned = String(dateStr).replace(/[^\d\-\/\.]/g, '')
  const parts = cleaned.includes('/') ? cleaned.split('/') : cleaned.includes('-') ? cleaned.split('-') : [cleaned]
  if (parts.length === 3) {
    if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  }
  try { return new Date(dateStr).toISOString().split('T')[0] } catch { return new Date().toISOString().split('T')[0] }
}

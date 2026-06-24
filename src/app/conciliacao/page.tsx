'use client'

import { useState, useMemo, useRef } from 'react'
import { Upload, CheckCircle2, XCircle, AlertTriangle, Search, Trash2, RefreshCw, FileText, ArrowRight, Ban } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { StatementEntry, Transaction } from '@/lib/types'
import { parseOFX, isOFX } from '@/lib/ofx'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'

export default function Conciliacao() {
  const { state, importStatement, matchStatementEntry, unmatchStatementEntry, ignoreStatementEntry, deleteStatementEntry } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [matchModal, setMatchModal] = useState<{ entry: StatementEntry } | null>(null)
  const [search, setSearch] = useState('')
  const [selectedMapping, setSelectedMapping] = useState('')
  const [autoMatched, setAutoMatched] = useState(0)

  const { statementEntries, transactions } = state

  const stats = useMemo(() => {
    const total = statementEntries.filter(e => !e.ignored).length
    const matched = statementEntries.filter(e => e.matchedTransactionId && !e.ignored).length
    const unmatched = statementEntries.filter(e => !e.matchedTransactionId && !e.ignored).length
    const ignored = statementEntries.filter(e => e.ignored).length
    const totalValue = statementEntries.filter(e => !e.ignored).reduce((a, e) => a + Math.abs(e.value), 0)
    const matchedValue = statementEntries.filter(e => e.matchedTransactionId && !e.ignored).reduce((a, e) => a + Math.abs(e.value), 0)
    return { total, matched, unmatched, ignored, totalValue, matchedValue }
  }, [statementEntries])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()

    // OFX detection
    if (isOFX(text)) {
      const { bank, transactions: ofxTrans } = parseOFX(text)
      if (ofxTrans.length === 0) { alert('Nenhuma transação encontrada no arquivo OFX'); return }

      const parsed: Omit<StatementEntry, 'id'>[] = []
      const lowerStmts = text.toLowerCase()

      for (const t of ofxTrans) {
        const descriptionLower = t.description.toLowerCase()
        const sameValueTrans = transactions.filter(tx => Math.abs(tx.value) === t.value && tx.type === t.type)
        const match = sameValueTrans.find(tx => {
          const txDesc = (tx.description || '').toLowerCase()
          return txDesc.includes(descriptionLower) || descriptionLower.includes(txDesc) ||
            txDesc.split(' ').some(w => w.length > 3 && descriptionLower.includes(w)) ||
            descriptionLower.split(' ').some(w => w.length > 3 && txDesc.includes(w))
        })

        const entry = {
          date: t.date,
          description: t.description,
          value: t.value,
          type: t.type,
          bank: t.bank,
          matchedTransactionId: match?.id,
          manuallyMatched: false,
          ignored: false,
          importedAt: new Date().toISOString(),
        }

        parsed.push(entry)
      }

      importStatement(parsed)
      const matchedCount = parsed.filter(e => e.matchedTransactionId).length
      alert(`OFX importado! ${parsed.length} transações de ${bank}. ${matchedCount} conciliadas automaticamente.`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    // CSV parsing (existing code)
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) { alert('Arquivo vazio ou inválido'); return }

    const header = lines[0].toLowerCase()
    const isNubank = header.includes('data') && header.includes('valor') && header.includes('descricao')
    const isItau = header.includes('data') && header.includes('valor') && header.includes('historico')
    const isBradesco = header.includes('data movimento') || (header.includes('data') && header.includes('lançamento'))

    const parsed: Omit<StatementEntry, 'id'>[] = []
    let mapped = 0

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map(c => c.trim().replace(/"/g, ''))
      if (cols.length < 3) continue

      let date = '', description = '', value = 0
      let income = false

      if (isNubank || (!isItau && !isBradesco)) {
        date = cols[0] || ''
        description = cols[2] || cols[1] || ''
        const rawVal = parseFloat(cols[1]?.replace('.', '').replace(',', '.') || '0')
        value = Math.abs(rawVal)
        income = rawVal > 0
      } else if (isItau) {
        date = cols[0] || ''
        description = cols[2] || cols[1] || ''
        const rawVal = parseFloat(cols[1]?.replace('.', '').replace(',', '.') || '0')
        value = Math.abs(rawVal)
        income = rawVal > 0
      } else {
        date = cols[0] || ''
        description = cols[2] || cols[1] || cols[0] || ''
        const rawVal = parseFloat(cols[1]?.replace('.', '').replace(',', '.') || '0')
        value = Math.abs(rawVal)
        income = rawVal > 0
      }

      if (!date || value === 0) continue

      const entry = {
        date: date.length === 10 ? date : date.split('/').reverse().join('-'),
        description,
        value,
        type: income ? 'income' as const : 'expense' as const,
        bank: 'Importado',
        matchedTransactionId: undefined as string | undefined,
        manuallyMatched: false,
        ignored: false,
        importedAt: new Date().toISOString(),
      }

      // auto-match
      const match = findBestMatch(entry, transactions)
      if (match) {
        entry.matchedTransactionId = match.id
        mapped++
      }

      parsed.push(entry)
    }

    if (parsed.length === 0) { alert('Nenhuma transação encontrada no arquivo. Verifique se o CSV está no formato correto.'); return }

    setAutoMatched(mapped)
    importStatement(parsed)
    if (fileRef.current) fileRef.current.value = ''
  }

  const entries = useMemo(() => {
    let list = [...statementEntries]
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(e =>
        e.description.toLowerCase().includes(s) ||
        formatCurrency(e.value).includes(s) ||
        formatDate(e.date).includes(s)
      )
    }
    return list.sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime())
  }, [statementEntries, search])

  const MatchModal = matchModal ? (
    <MatchForm
      entry={matchModal.entry}
      transactions={transactions}
      selectedMapping={selectedMapping}
      onMappingChange={setSelectedMapping}
      onMatch={(tid) => { matchStatementEntry(matchModal.entry.id, tid); setMatchModal(null); setSelectedMapping('') }}
      onClose={() => { setMatchModal(null); setSelectedMapping('') }}
    />
  ) : null

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Conciliação Bancária</h1>
          <p className="mt-1 text-sm text-zinc-500">Importe extratos e concilie com suas transações</p>
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
        <input ref={fileRef} type="file" accept=".csv,.txt,.ofx" onChange={handleFile} className="hidden" />
        <Upload size={40} className="mx-auto text-zinc-400 mb-3" />
        <p className="text-sm font-medium text-zinc-900 mb-1">Importar Extrato CSV</p>
        <p className="text-xs text-zinc-500 mb-4">Formatos suportados: Nubank, Itaú, Bradesco, ou CSV genérico (data;valor;descrição)</p>
        <Button onClick={() => fileRef.current?.click()}><Upload size={16} /> Selecionar Arquivo</Button>
        {autoMatched > 0 && (
          <p className="text-xs text-emerald-500 mt-2">{autoMatched} transação(ões) conciliada(s) automaticamente</p>
        )}
      </div>

      {/* Stats */}
      {statementEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-medium text-zinc-500">Total</span>
            <p className="mt-1 text-lg font-bold text-zinc-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-medium text-emerald-500">Conciliados</span>
            <p className="mt-1 text-lg font-bold text-emerald-500">{stats.matched}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-medium text-orange-500">Pendentes</span>
            <p className="mt-1 text-lg font-bold text-orange-500">{stats.unmatched}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-medium text-zinc-500">Ignorados</span>
            <p className="mt-1 text-lg font-bold text-zinc-500">{stats.ignored}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-medium text-zinc-500">Valor Total</span>
            <p className="mt-1 text-lg font-bold text-zinc-900">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-medium text-emerald-500">Valor Conciliado</span>
            <p className="mt-1 text-lg font-bold text-emerald-500">{formatCurrency(stats.matchedValue)}</p>
          </div>
        </div>
      )}

      {/* Search */}
      {statementEntries.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar no extrato..." 
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400" />
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {entries.map(entry => {
          const matchedTx = entry.matchedTransactionId ? transactions.find(t => t.id === entry.matchedTransactionId) : null
          return (
            <div key={entry.id} className={`rounded-2xl border p-4 flex items-center gap-4 group ${entry.ignored ? 'border-zinc-200 bg-zinc-100 opacity-50' : entry.matchedTransactionId ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-200 bg-white'}`}>
              {entry.ignored ? (
                <div className="h-8 w-8 rounded-full bg-zinc-300 flex items-center justify-center">
                  <Ban size={16} className="text-zinc-500" />
                </div>
              ) : entry.matchedTransactionId ? (
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle size={20} className="text-orange-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900">{entry.description}</span>
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-medium ${entry.type === 'income' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                    {entry.type === 'income' ? 'Entrada' : 'Saída'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{formatDate(entry.date)} · {entry.bank}</p>
                {matchedTx && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-500 bg-emerald-500/5 rounded px-1.5 py-0.5 w-fit">
                    <CheckCircle2 size={8} />
                    <span>Conciliado com: {matchedTx.description} ({formatCurrency(matchedTx.value)})</span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold text-sm ${entry.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.value)}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!entry.ignored && !entry.matchedTransactionId && (
                  <button onClick={() => { setMatchModal({ entry }); setSelectedMapping('') }}
                    className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-500/10" title="Conciliar">
                    <RefreshCw size={14} />
                  </button>
                )}
                {entry.matchedTransactionId && (
                  <button onClick={() => unmatchStatementEntry(entry.id)}
                    className="rounded-lg p-1.5 text-orange-500 hover:bg-orange-500/10" title="Desfazer conciliação">
                    <XCircle size={14} />
                  </button>
                )}
                <button onClick={() => ignoreStatementEntry(entry.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100" title={entry.ignored ? 'Reativar' : 'Ignorar'}>
                  <Ban size={14} />
                </button>
                <button onClick={() => deleteStatementEntry(entry.id)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500" title="Remover">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
        {statementEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <FileText size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum extrato importado</p>
            <p className="text-sm mt-1">Faça upload de um arquivo CSV do seu banco para começar</p>
          </div>
        )}
      </div>

      {MatchModal}
    </div>
  )
}

function findBestMatch(entry: { date: string; description: string; value: number; type: string }, transactions: Transaction[]): Transaction | null {
  const candidates = transactions.filter(t => {
    const sameValue = Math.abs(Math.abs(t.value) - entry.value) < 0.01
    const sameType = (t.type === 'income') === (entry.type === 'income')
    const descSimilar = t.description.toLowerCase().includes(entry.description.slice(0, 10).toLowerCase()) ||
      entry.description.toLowerCase().includes(t.description.slice(0, 10).toLowerCase())
    return sameValue && sameType && descSimilar
  })
  return candidates.length === 1 ? candidates[0] : null
}

function MatchForm({ entry, transactions, selectedMapping, onMappingChange, onMatch, onClose }: {
  entry: StatementEntry
  transactions: Transaction[]
  selectedMapping: string
  onMappingChange: (v: string) => void
  onMatch: (transactionId: string) => void
  onClose: () => void
}) {
  const suggestions = useMemo(() => {
    return transactions.filter(t => {
      const sameValue = Math.abs(Math.abs(t.value) - entry.value) < 0.01
      const sameType = (t.type === 'income') === (entry.type === 'income')
      return sameValue && sameType
    }).slice(0, 20)
  }, [transactions, entry])

  return (
    <Modal title="Conciliar Lançamento" onClose={onClose} open>
      <div className="space-y-4">
        <div className="rounded-xl bg-zinc-50 p-3 border border-zinc-200">
          <p className="text-xs text-zinc-500 mb-1">Lançamento do Extrato</p>
          <p className="text-sm font-medium text-zinc-900">{entry.description}</p>
          <div className="flex gap-4 mt-1 text-xs text-zinc-500">
            <span>{formatDate(entry.date)}</span>
            <span className={entry.type === 'income' ? 'text-emerald-500' : 'text-red-500'}>{formatCurrency(entry.value)}</span>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Sugestões automáticas</label>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {suggestions.map(t => (
                <button key={t.id} onClick={() => { onMappingChange(t.id); onMatch(t.id) }}
                  className="w-full text-left rounded-xl border border-zinc-200 p-3 hover:border-emerald-500 transition-colors">
                  <p className="text-sm font-medium text-zinc-900">{t.description}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {formatDate(t.date)} · {t.category} · {formatCurrency(t.value)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Ou busque uma transação</label>
          <Select value={selectedMapping} onChange={e => onMappingChange(e.target.value)}
            options={[
              { value: '', label: 'Selecione...' },
              ...transactions.map(t => ({ value: t.id, label: `${formatDate(t.date)} - ${t.description} - ${formatCurrency(t.value)}` }))
            ]} />
          {selectedMapping && (
            <Button onClick={() => onMatch(selectedMapping)} className="mt-2">
              <CheckCircle2 size={16} /> Conciliar
            </Button>
          )}
        </div>

        {suggestions.length === 0 && !selectedMapping && (
          <p className="text-sm text-zinc-500 text-center py-4">
            Nenhuma transação com valor correspondente. Crie uma nova transação ou ignore este lançamento.
          </p>
        )}
      </div>
    </Modal>
  )
}

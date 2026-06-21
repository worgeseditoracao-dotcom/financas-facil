'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, FileText, CheckCircle2, AlertTriangle, Clock, CreditCard, Building2, Receipt, ShoppingCart, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import type { Bill, CreditCard as CreditCardType, CardPurchase } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const CARD_COLORS = [
  { value: 'from-emerald-600 to-emerald-800', label: 'Verde' },
  { value: 'from-purple-600 to-purple-800', label: 'Roxo' },
  { value: 'from-blue-600 to-blue-800', label: 'Azul' },
  { value: 'from-red-600 to-red-800', label: 'Vermelho' },
  { value: 'from-orange-600 to-orange-800', label: 'Laranja' },
  { value: 'from-zinc-700 to-zinc-900', label: 'Preto' },
]

export default function Bills() {
  const { state, addBill, updateBill, deleteBill, addCreditCard, updateCreditCard, deleteCreditCard, addCardPurchase, toggleCardPurchase, removeCardPurchase } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Bill | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'bill' | 'financing' | 'installment' | 'card' | 'advance'>('all')
  const [modFilter, setModFilter] = useState<'all' | 'personal' | 'business'>('all')
  const [showCards, setShowCards] = useState(true)
  const [showCardForm, setShowCardForm] = useState(false)
  const [editCard, setEditCard] = useState<CreditCardType | null>(null)
  const [purchaseCard, setPurchaseCard] = useState<CreditCardType | null>(null)

  const { bills, creditCards, suppliers } = state
  const supplierMap = useMemo(() => {
    const m: Record<string, string> = {}
    suppliers.forEach(s => { m[s.id] = s.name })
    return m
  }, [suppliers])
  const today = new Date().toISOString().split('T')[0]

  const cardDebts = useMemo(() => {
    const debts: (Bill & { _cardPurchaseId?: string; _cardName?: string })[] = []
    const filteredCards = modFilter === 'all' ? creditCards : creditCards.filter(c => c.module === modFilter)
    filteredCards.forEach(card => {
      const dueDate = new Date()
      dueDate.setDate(card.dueDay)
      if (dueDate < new Date()) dueDate.setMonth(dueDate.getMonth() + 1)
      const dateStr = dueDate.toISOString().split('T')[0]
      card.purchases.filter(p => !p.paid).forEach(p => {
        const installmentValue = p.installments > 1 ? p.value / p.installments : p.value
        debts.push({
          id: `card-${p.id}`, name: p.description,
          description: `${card.name}${p.installments > 1 ? ` (${p.installments}x)` : ''}`,
          value: installmentValue, dueDate: dateStr, category: 'Cartão de Crédito',
          paid: false, recurring: false, module: card.module, type: 'card', cardId: card.id,
          createdAt: p.date, _cardPurchaseId: p.id, _cardName: card.name,
        })
      })
    })
    return debts
  }, [creditCards, modFilter])

  const allItems = useMemo(() => [...bills, ...cardDebts], [bills, cardDebts])

  const stats = useMemo(() => {
    const filtered = modFilter === 'all' ? allItems : allItems.filter(b => b.module === modFilter)
    const all = filtered.reduce((a, b) => a + b.value, 0)
    const paid = filtered.filter(b => b.paid).reduce((a, b) => a + b.value, 0)
    const pending = filtered.filter(b => !b.paid && b.dueDate >= today).reduce((a, b) => a + b.value, 0)
    const overdue = filtered.filter(b => !b.paid && b.dueDate < today).reduce((a, b) => a + b.value, 0)
    return { all, paid, pending, overdue }
  }, [allItems, today, modFilter])

  const filteredBills = useMemo(() => {
    let f = allItems
    if (modFilter !== 'all') f = f.filter(b => b.module === modFilter)
    if (typeFilter !== 'all') f = f.filter(b => b.type === typeFilter)
    switch (filter) {
      case 'paid': return f.filter(b => b.paid)
      case 'pending': return f.filter(b => !b.paid && b.dueDate >= today)
      case 'overdue': return f.filter(b => !b.paid && b.dueDate < today)
      default: return f
    }
  }, [allItems, filter, typeFilter, today, modFilter])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financing': return <Building2 size={14} />
      case 'installment': return <Receipt size={14} />
      case 'card': return <CreditCard size={14} />
      default: return <FileText size={14} />
    }
  }

  const handleTogglePaid = (bill: Bill & { _cardPurchaseId?: string }) => {
    if (bill._cardPurchaseId && bill.cardId) {
      toggleCardPurchase(bill.cardId, bill._cardPurchaseId)
    } else {
      updateBill({ ...bill, paid: !bill.paid, paidDate: !bill.paid ? today : undefined })
    }
  }

  const handleDeleteItem = (bill: Bill & { _cardPurchaseId?: string }) => {
    if (bill._cardPurchaseId && bill.cardId) {
      removeCardPurchase(bill.cardId, bill._cardPurchaseId)
    } else {
      deleteBill(bill.id)
    }
  }

  const filteredCards = creditCards.filter(c => modFilter === 'all' || c.module === modFilter)

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Contas a Pagar</h1>
          <p className="mt-1 text-sm text-zinc-500">Todas as suas dívidas em um só lugar</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Nova Conta</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'personal', 'business'] as const).map(m => (
          <button key={m} onClick={() => setModFilter(m)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${modFilter === m ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>
            {m === 'all' ? 'Todas' : m === 'personal' ? 'Pessoal' : 'PJ'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Total</span>
          <p className="mt-1 text-lg font-bold text-zinc-900">{formatCurrency(stats.all)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Pagas</span>
          <p className="mt-1 text-lg font-bold text-emerald-500">{formatCurrency(stats.paid)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Pendentes</span>
          <p className="mt-1 text-lg font-bold text-blue-500">{formatCurrency(stats.pending)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <span className="text-xs font-medium text-zinc-500">Atrasadas</span>
          <p className="mt-1 text-lg font-bold text-red-500">{formatCurrency(stats.overdue)}</p>
        </div>
      </div>

      {/* Seção Cartões de Crédito */}
      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        <button onClick={() => setShowCards(!showCards)} className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">Cartões de Crédito</h2>
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{filteredCards.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setShowCardForm(true); setEditCard(null) }}><Plus size={14} /> Novo Cartão</Button>
            {showCards ? <ChevronUp size={18} className="text-zinc-400" /> : <ChevronDown size={18} className="text-zinc-400" />}
          </div>
        </button>

        {showCards && (
          <div className="px-5 pb-5 space-y-4">
            {filteredCards.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">Nenhum cartão cadastrado ainda.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCards.map(card => {
                  const activePurchases = card.purchases.filter(p => !p.paid)
                  const totalFatura = activePurchases.reduce((a, p) => a + (p.installments > 1 ? p.value / p.installments : p.value), 0)
                  const utilizacao = card.limit > 0 ? ((totalFatura / card.limit) * 100).toFixed(0) : '0'
                  const cardGradient = card.color || 'from-emerald-600 to-emerald-800'

                  return (
                    <div key={card.id} className="rounded-xl border border-zinc-200 bg-white overflow-hidden group">
                      <div className={`bg-gradient-to-br ${cardGradient} p-4 relative`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] text-white/60 uppercase tracking-wider">{card.brand}</p>
                            <p className="text-base font-bold text-white mt-0.5">{card.name}</p>
                          </div>
                          <CreditCard size={22} className="text-white/40" />
                        </div>
                        <div className="flex gap-3 text-[10px] text-white/70 mt-2">
                          <span>Fecha dia {card.closingDay}</span>
                          <span>Vence dia {card.dueDay}</span>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditCard(card); setShowCardForm(true) }} className="rounded p-1 bg-white/20 hover:bg-white/30"><Pencil size={10} className="text-white" /></button>
                          <button onClick={() => deleteCreditCard(card.id)} className="rounded p-1 bg-white/20 hover:bg-white/30"><Trash2 size={10} className="text-white" /></button>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Limite</span>
                          <span className="font-bold text-zinc-900">{formatCurrency(card.limit)}</span>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-0.5">
                            <span className="text-zinc-500">Utilização</span>
                            <span className={parseInt(utilizacao) > 80 ? 'text-red-500 font-medium' : 'text-emerald-500 font-medium'}>{utilizacao}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                            <div className={`h-full rounded-full ${parseInt(utilizacao) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, parseInt(utilizacao))}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Fatura</span>
                          <span className="font-bold text-zinc-900">{formatCurrency(totalFatura)}</span>
                        </div>

                        {activePurchases.length > 0 && (
                          <div className="border-t border-zinc-200 pt-2">
                            <p className="text-[10px] font-medium text-zinc-500 mb-1">{activePurchases.length} compra(s)</p>
                            <div className="space-y-0.5 max-h-24 overflow-y-auto">
                              {activePurchases.map(p => (
                                <div key={p.id} className="flex items-center justify-between text-[11px] py-0.5">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <button onClick={() => toggleCardPurchase(card.id, p.id)} className="shrink-0 h-3 w-3 rounded border border-zinc-300 flex items-center justify-center hover:border-emerald-500" />
                                    <span className="truncate text-zinc-900">{p.description}</span>
                                    {p.installments > 1 && <span className="text-zinc-400">{p.installments}x</span>}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-zinc-900">{formatCurrency(p.installments > 1 ? p.value / p.installments : p.value)}</span>
                                    <button onClick={() => removeCardPurchase(card.id, p.id)} className="text-zinc-400 hover:text-red-500"><X size={8} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button onClick={() => setPurchaseCard(card)} className="w-full text-center text-[11px] text-emerald-500 hover:text-emerald-400 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                          + Adicionar Compra
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros das contas */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'overdue', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${filter === f ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200 hover:bg-zinc-100'}`}>
            {f === 'all' ? 'Todas' : f === 'paid' ? 'Pagas' : f === 'pending' ? 'Pendentes' : 'Atrasadas'}
          </button>
        ))}
        <span className="w-px bg-zinc-200 mx-1" />
        {(['all', 'bill', 'financing', 'installment', 'card', 'advance'] as const).map(f => (
          <button key={f} onClick={() => setTypeFilter(f)}
            className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${typeFilter === f ? 'bg-emerald-500 text-black' : 'bg-zinc-50 text-zinc-500 border border-zinc-200'}`}>
            {f === 'all' ? 'Todos' : f === 'bill' ? 'Contas' : f === 'financing' ? 'Financ.' : f === 'installment' ? 'Parcelas' : f === 'card' ? 'Cartão' : 'Antecip.'}
          </button>
        ))}
      </div>

      {/* Lista de contas (inclui compras de cartão) */}
      <div className="space-y-2">
        {filteredBills.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(bill => {
          const isOverdue = !bill.paid && bill.dueDate < today
          const isDueSoon = !bill.paid && bill.dueDate >= today && bill.dueDate <= new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
          return (
            <div key={bill.id} className={`rounded-2xl border p-4 flex items-center gap-4 group ${isOverdue ? 'border-red-500/30 bg-red-500/5' : isDueSoon ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-zinc-200 bg-white'}`}>
              <button onClick={() => handleTogglePaid(bill)}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${bill.paid ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500 hover:bg-emerald-500/20'}`}>
                <CheckCircle2 size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">{getTypeIcon(bill.type)}</span>
                  <p className={`font-medium text-zinc-900 ${bill.paid ? 'line-through opacity-50' : ''}`}>{bill.name}</p>
                  {isOverdue && <AlertTriangle size={14} className="text-red-500" />}
                  {isDueSoon && <Clock size={14} className="text-yellow-500" />}
                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-medium ${bill.module === 'personal' ? 'text-blue-500 bg-blue-500/10' : 'text-emerald-500 bg-emerald-500/10'}`}>
                    {bill.module === 'personal' ? 'Pessoal' : 'PJ'}
                  </span>
                  {(bill as any)._cardName && (
                    <span className="text-[10px] text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">{bill._cardName}</span>
                  )}
                  {bill.supplierId && supplierMap[bill.supplierId] && (
                    <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">{supplierMap[bill.supplierId]}</span>
                  )}
                  {bill.type !== 'bill' && !(bill as any)._cardPurchaseId && (
                    <span className="text-[10px] uppercase text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {bill.type === 'financing' ? 'Financiamento' : bill.type === 'installment' ? `Parcela ${bill.installment?.current}/${bill.installment?.total}` : bill.type === 'card' ? 'Cartão' : 'Antecipação'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {bill.category} · Vence {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                  {bill.recurring && ' · Recorrente'}
                  {bill.financing && ` · ${((bill.financing.paid / bill.financing.total) * 100).toFixed(0)}% pago`}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${bill.paid ? 'text-emerald-500 line-through opacity-50' : 'text-zinc-900'}`}>
                  {formatCurrency(bill.value)}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => !(bill as any)._cardPurchaseId && setEditing(bill)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><Pencil size={14} /></button>
                <button onClick={() => handleDeleteItem(bill)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {filteredBills.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <FileText size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhuma conta encontrada</p>
            <p className="text-sm mt-1">Adicione contas, financiamentos, parcelas ou compre no cartão</p>
          </div>
        )}
      </div>

      {(showForm || editing) && (
        <BillForm bill={editing} creditCards={creditCards}
          onSave={(data) => { editing ? (updateBill({ ...editing, ...data }), setEditing(null)) : (addBill(data), setShowForm(false)) }}
          onClose={() => { setShowForm(false); setEditing(null) }} />
      )}

      {showCardForm && (
        <CardForm card={editCard}
          onSave={(data) => { editCard ? (updateCreditCard({ ...editCard, ...data }), setEditCard(null)) : addCreditCard(data); setShowCardForm(false); setEditCard(null) }}
          onClose={() => { setShowCardForm(false); setEditCard(null) }} />
      )}

      {purchaseCard && (
        <PurchaseForm card={purchaseCard}
          onSave={(p) => { addCardPurchase(purchaseCard.id, p); setPurchaseCard(null) }}
          onClose={() => setPurchaseCard(null)} />
      )}
    </div>
  )
}

function BillForm({ bill, creditCards, onSave, onClose }: {
  bill?: Bill | null
  creditCards: { id: string; name: string; module: string }[]
  onSave: (data: Omit<Bill, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const { state } = useStore()
  const [name, setName] = useState(bill?.name || '')
  const [value, setValue] = useState(bill ? String(bill.value) : '')
  const [dueDate, setDueDate] = useState(bill?.dueDate || '')
  const [category, setCategory] = useState(bill?.category || 'Água')
  const [type, setType] = useState(bill?.type || 'bill')
  const [recurring, setRecurring] = useState(bill?.recurring || false)
  const [module, setModule] = useState<'personal' | 'business'>(bill?.module || 'personal')
  const [totalInstallments, setTotalInstallments] = useState(bill?.installment?.total ? String(bill.installment.total) : '')
  const [currentInstallment, setCurrentInstallment] = useState(bill?.installment?.current ? String(bill.installment.current) : '')
  const [financingTotal, setFinancingTotal] = useState(bill?.financing?.total ? String(bill.financing.total) : '')
  const [financingPaid, setFinancingPaid] = useState(bill?.financing?.paid ? String(bill.financing.paid) : '')
  const [supplierId, setSupplierId] = useState(bill?.supplierId || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !value || !dueDate) return
    onSave({ name: name.trim(), value: Math.abs(parseFloat(value)), dueDate, category, paid: false, recurring, type: type as Bill['type'], module,
      installment: type === 'installment' && totalInstallments ? { total: parseInt(totalInstallments), current: parseInt(currentInstallment) || 1 } : undefined,
      financing: type === 'financing' && financingTotal ? { total: Math.abs(parseFloat(financingTotal)), paid: Math.abs(parseFloat(financingPaid) || 0), rate: 0 } : undefined,
      supplierId: supplierId || undefined,
    })
  }

  return (
    <Modal title={bill ? 'Editar' : 'Nova Conta'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" placeholder="Ex: Conta de Luz" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Tipo</label>
          <div className="flex flex-wrap gap-2">
            {[{ value: 'bill', label: 'Conta' }, { value: 'financing', label: 'Financiamento' }, { value: 'installment', label: 'Parcelamento' }, { value: 'advance', label: 'Antecipação' }].map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${type === t.value ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input label="Valor (R$)" type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} required />
          <Input label="Vencimento" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Categoria</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
            {['Água', 'Luz', 'Internet', 'Aluguel', 'Impostos', 'Telefone', 'Seguro', 'Saúde', 'Educação', 'Transporte', 'Outros'].map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        {type === 'installment' && (
          <div className="flex gap-2">
            <Input label="Total Parcelas" type="number" value={totalInstallments} onChange={e => setTotalInstallments(e.target.value)} />
            <Input label="Parcela Atual" type="number" value={currentInstallment} onChange={e => setCurrentInstallment(e.target.value)} />
          </div>
        )}
        {type === 'financing' && (
          <div className="flex gap-2">
            <Input label="Valor Total" type="number" value={financingTotal} onChange={e => setFinancingTotal(e.target.value)} />
            <Input label="Já Pago" type="number" value={financingPaid} onChange={e => setFinancingPaid(e.target.value)} />
          </div>
        )}
        {state.suppliers.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Fornecedor (opcional)</label>
            <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
              <option value="">Sem fornecedor</option>
              {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer">
          <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="h-4 w-4 rounded border-zinc-200 text-emerald-500" />
          Recorrente
        </label>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{bill ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function CardForm({ card, onSave, onClose }: {
  card?: CreditCardType | null
  onSave: (data: Omit<CreditCard, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(card?.name || '')
  const [brand, setBrand] = useState(card?.brand || 'visa')
  const [limit, setLimit] = useState(card ? String(card.limit) : '')
  const [closingDay, setClosingDay] = useState(card ? String(card.closingDay) : '5')
  const [dueDay, setDueDay] = useState(card ? String(card.dueDay) : '12')
  const [module, setModule] = useState<'personal' | 'business'>(card?.module || 'personal')
  const [color, setColor] = useState(card?.color || 'from-emerald-600 to-emerald-800')

  return (
    <Modal title={card ? 'Editar Cartão' : 'Novo Cartão'} onClose={onClose} open>
      <form onSubmit={(e) => { e.preventDefault(); if (!name || !limit) return;
        onSave({ name: name.trim(), brand: brand as any, limit: Math.abs(parseFloat(limit)), closingDay: parseInt(closingDay) || 5, dueDay: parseInt(dueDay) || 12, module, color, purchases: card?.purchases || [] })
      }} className="space-y-4">
        <Input label="Nome" placeholder="Ex: Nubank" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <select value={brand} onChange={e => setBrand(e.target.value)} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
          {[{ value: 'visa', label: 'Visa' }, { value: 'mastercard', label: 'Mastercard' }, { value: 'elo', label: 'Elo' }, { value: 'amex', label: 'Amex' }].map(b => (<option key={b.value} value={b.value}>{b.label}</option>))}
        </select>
        <Input label="Limite (R$)" type="number" value={limit} onChange={e => setLimit(e.target.value)} required />
        <div className="flex gap-2">
          <Input label="Fechamento" type="number" min="1" max="31" value={closingDay} onChange={e => setClosingDay(e.target.value)} />
          <Input label="Vencimento" type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Cor</label>
          <div className="flex gap-2">
            {CARD_COLORS.map(c => (
              <button key={c.value} type="button" onClick={() => setColor(c.value)}
                className={`h-7 w-7 rounded-lg bg-gradient-to-br ${c.value} ${color === c.value ? 'ring-2 ring-zinc-900 ring-offset-1' : ''}`} title={c.label} />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setModule('personal')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'personal' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Pessoal</button>
          <button type="button" onClick={() => setModule('business')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${module === 'business' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Negócio</button>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{card ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function PurchaseForm({ card, onSave, onClose }: {
  card: CreditCardType
  onSave: (purchase: Omit<CardPurchase, 'id'>) => void
  onClose: () => void
}) {
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [installments, setInstallments] = useState('1')

  return (
    <Modal title={`Nova Compra - ${card.name}`} onClose={onClose} open>
      <form onSubmit={(e) => { e.preventDefault(); if (!description || !value) return;
        onSave({ description: description.trim(), value: Math.abs(parseFloat(value)), date: new Date().toISOString().split('T')[0], installments: parseInt(installments) || 1, category: 'Cartão', paid: false })
      }} className="space-y-4">
        <Input label="Descrição" placeholder="Ex: Roupas" value={description} onChange={e => setDescription(e.target.value)} required autoFocus />
        <div className="flex gap-2">
          <Input label="Valor (R$)" type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} required />
          <div className="w-28">
            <Input label="Parcelas" type="number" min="1" max="48" value={installments} onChange={e => setInstallments(e.target.value)} />
          </div>
        </div>
        {parseInt(installments) > 1 && (
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 text-sm">
            <span className="text-zinc-500">Valor da parcela: </span>
            <span className="font-bold text-emerald-500">{formatCurrency((parseFloat(value) || 0) / (parseInt(installments) || 1))}</span>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">Adicionar</Button>
        </div>
      </form>
    </Modal>
  )
}

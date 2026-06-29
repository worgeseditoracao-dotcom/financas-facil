'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Building2, Trash2, TrendingUp, Package, ShoppingCart, DollarSign, ArrowDown, Wallet } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function EmpresasPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [showProduct, setShowProduct] = useState(false)
  const [showSale, setShowSale] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [prodForm, setProdForm] = useState({ name: '', sale_price: '', cost_price: '' })
  const [saleForm, setSaleForm] = useState({ productId: '', quantity: '1', sale_price: '', cost_price: '', sale_date: new Date().toISOString().split('T')[0] })
  const [expForm, setExpForm] = useState({ name: '', value: '', category: 'Operacional', expense_date: new Date().toISOString().split('T')[0] })

  const load = useCallback(async () => {
    const res = await fetch('/api/companies')
    const data = await res.json()
    setCompanies(data.companies || [])
    if (!selected && data.companies?.[0]) setSelected(data.companies[0].id)
  }, [selected])

  const loadAnalytics = useCallback(async () => {
    if (!selected) return
    const res = await fetch(`/api/companies?action=analytics&companyId=${selected}`)
    setAnalytics(await res.json())
  }, [selected])

  const loadProducts = useCallback(async () => {
    if (!selected) return
    const res = await fetch(`/api/products?companyId=${selected}`)
    const data = await res.json()
    setProducts(data.products || [])
  }, [selected])

  const loadExpenses = useCallback(async () => {
    if (!selected) return
    const res = await fetch(`/api/expenses?companyId=${selected}`)
    const data = await res.json()
    setExpenses(data.expenses || [])
  }, [selected])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadAnalytics(); loadProducts(); loadExpenses() }, [loadAnalytics, loadProducts, loadExpenses])

  const addCompany = async () => {
    if (!newName) return
    await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, monthly_revenue_target: Number(newTarget) }) })
    setNewName(''); setNewTarget(''); setShowAdd(false); load()
  }

  const removeCompany = async (id: string) => {
    if (!confirm('Excluir empresa e todos os dados?')) return
    await fetch(`/api/companies?id=${id}`, { method: 'DELETE' }); load()
  }

  const addProduct = async () => {
    if (!prodForm.name || !prodForm.sale_price) return
    await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: selected, ...prodForm, sale_price: Number(prodForm.sale_price), cost_price: Number(prodForm.cost_price || 0) }) })
    setProdForm({ name: '', sale_price: '', cost_price: '' }); setShowProduct(false); loadProducts()
  }

  const addSale = async () => {
    if (!saleForm.productId || !saleForm.sale_price || !saleForm.sale_date) return
    await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: selected, ...saleForm, sale_price: Number(saleForm.sale_price), cost_price: Number(saleForm.cost_price || 0), quantity: Number(saleForm.quantity) }) })
    setSaleForm({ productId: '', quantity: '1', sale_price: '', cost_price: '', sale_date: new Date().toISOString().split('T')[0] }); setShowSale(false); loadAnalytics()
  }

  const addExpense = async () => {
    if (!expForm.name || !expForm.value) return
    await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ companyId: selected, ...expForm, value: Math.abs(Number(expForm.value)) }) })
    setExpForm({ name: '', value: '', category: 'Operacional', expense_date: new Date().toISOString().split('T')[0] }); setShowExpense(false); loadExpenses()
  }

  const totalExpenses = expenses.reduce((a, e) => a + Number(e.value), 0)
  const profit = (analytics?.totalProfit || 0) - totalExpenses
  const fmt = (v: number) => `R$ ${v.toFixed(2)}`

  if (!user) return null

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Minhas Empresas</h1>
          <p className="text-sm text-zinc-500">{companies.length} empresa(s)</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-4 flex flex-col sm:flex-row gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da empresa" className="flex-1 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" autoFocus />
          <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Meta mensal R$" type="number" className="w-40 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
          <button onClick={addCompany} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white">Criar</button>
          <button onClick={() => setShowAdd(false)} className="rounded-xl border px-4 py-2 text-sm dark:border-zinc-600">Cancelar</button>
        </div>
      )}

      {companies.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {companies.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${selected === c.id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{c.name}</button>
            ))}
          </div>

          {/* RESUMO GERAL */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat title="Faturamento" value={fmt(analytics?.totalRevenue || 0)} color="text-blue-600" />
            <Stat title="Custos Produtos" value={fmt(analytics?.totalCost || 0)} color="text-red-600" />
            <Stat title="Despesas" value={fmt(totalExpenses)} color="text-orange-600" />
            <Stat title="Lucro Líquido" value={fmt(profit)} color={profit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
          </div>

          {/* DESPESAS */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowDown size={16} className="text-red-500" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Despesas ({expenses.length})</h3>
              </div>
              <button onClick={() => setShowExpense(!showExpense)} className="text-xs text-emerald-500 font-medium">{showExpense ? 'Fechar' : '+ Nova Despesa'}</button>
            </div>
            {showExpense && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
                <input value={expForm.name} onChange={e => setExpForm({ ...expForm, name: e.target.value })} placeholder="Nome da despesa" className="flex-1 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <input value={expForm.value} onChange={e => setExpForm({ ...expForm, value: e.target.value })} placeholder="Valor R$" type="number" className="w-28 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })} className="rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50">
                  {['Operacional','Marketing','Ferramentas','Impostos','Funcionários','Aluguel','Material','Outros'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={expForm.expense_date} onChange={e => setExpForm({ ...expForm, expense_date: e.target.value })} type="date" className="rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <button onClick={addExpense} className="rounded-xl bg-red-500 px-4 py-2 text-sm text-white">Registrar</button>
              </div>
            )}
            {expenses.length > 0 ? (
              <div className="space-y-1">
                {expenses.slice(0, 10).map(e => (
                  <div key={e.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-zinc-400 shrink-0">{e.expense_date?.split('T')[0] || e.expense_date?.substring(0,10)}</span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">{e.name}</span>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">{e.category}</span>
                    </div>
                    <span className="text-red-500 font-medium shrink-0">{fmt(Number(e.value))}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-zinc-400 text-center py-4">Nenhuma despesa registrada</p>}
          </div>

          {/* PRODUTOS */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Produtos ({products.length})</h3>
              <button onClick={() => setShowProduct(true)} className="text-xs text-emerald-500 font-medium">+ Adicionar</button>
            </div>
            {showProduct && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} placeholder="Nome" className="flex-1 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <input value={prodForm.sale_price} onChange={e => setProdForm({ ...prodForm, sale_price: e.target.value })} placeholder="Preço venda R$" type="number" className="w-32 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <input value={prodForm.cost_price} onChange={e => setProdForm({ ...prodForm, cost_price: e.target.value })} placeholder="Custo R$" type="number" className="w-32 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <button onClick={addProduct} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs text-white">Salvar</button>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(p => {
                const margin = p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0
                return (
                  <div key={p.id} className="rounded-xl border p-3 flex items-center justify-between dark:border-zinc-700">
                    <div><p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p><p className="text-xs text-zinc-500">Venda R$ {p.sale_price} · Custo R$ {p.cost_price}</p></div>
                    <span className={`text-xs font-bold ${margin >= 30 ? 'text-emerald-600' : margin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>{margin.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* VENDAS */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Registrar Venda</h3>
              <button onClick={() => setShowSale(!showSale)} className="text-xs text-emerald-500 font-medium">{showSale ? 'Fechar' : '+ Nova'}</button>
            </div>
            {showSale && (
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                <select value={saleForm.productId} onChange={e => { const p = products.find(x => x.id === e.target.value); setSaleForm({ ...saleForm, productId: e.target.value, sale_price: String(p?.sale_price || ''), cost_price: String(p?.cost_price || '') }) }} className="rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50">
                  <option value="">Produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input value={saleForm.quantity} onChange={e => setSaleForm({ ...saleForm, quantity: e.target.value })} placeholder="Qtd" type="number" className="w-16 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <input value={saleForm.sale_price} onChange={e => setSaleForm({ ...saleForm, sale_price: e.target.value })} placeholder="Preço R$" type="number" className="w-28 rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <input value={saleForm.sale_date} onChange={e => setSaleForm({ ...saleForm, sale_date: e.target.value })} type="date" className="rounded-xl border px-3 py-2 text-sm dark:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-50" />
                <button onClick={addSale} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white">Registrar</button>
              </div>
            )}
          </div>

          {/* Lucro por produto */}
          {analytics?.byProduct?.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5">
              <h3 className="text-sm font-semibold mb-3 text-zinc-900 dark:text-zinc-50">Lucro por Produto</h3>
              <div className="space-y-1">
                {analytics.byProduct.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0 border-zinc-100 dark:border-zinc-700">
                    <span className="text-zinc-700 dark:text-zinc-300">{p.product}</span>
                    <div className="flex gap-4 text-right">
                      <span className="text-zinc-500">{p.quantity}x</span>
                      <span className={p.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}>R$ {p.profit.toFixed(2)}</span>
                      <span className="text-zinc-400 w-14">{p.margin.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button onClick={() => removeCompany(selected!)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"><Trash2 size={12} /> Excluir empresa</button>
          </div>
        </>
      )}

      {companies.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhuma empresa cadastrada</p>
          <p className="text-xs mt-1">Adicione sua primeira empresa para começar</p>
        </div>
      )}
    </div>
  )
}

function Stat({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}

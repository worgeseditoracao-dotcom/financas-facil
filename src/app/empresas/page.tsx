'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Building2, Trash2, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function EmpresasPage() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [showProduct, setShowProduct] = useState(false)
  const [showSale, setShowSale] = useState(false)
  const [prodForm, setProdForm] = useState({ name: '', sale_price: '', cost_price: '' })
  const [saleForm, setSaleForm] = useState({ productId: '', quantity: '1', sale_price: '', cost_price: '', sale_date: new Date().toISOString().split('T')[0] })

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

  useEffect(() => { load() }, [load])
  useEffect(() => { loadAnalytics(); loadProducts() }, [loadAnalytics, loadProducts])

  const addCompany = async () => {
    if (!newName) return
    await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, monthly_revenue_target: Number(newTarget) }) })
    setNewName(''); setNewTarget(''); setShowAdd(false); load()
  }

  const removeCompany = async (id: string) => {
    if (!confirm('Excluir empresa e todos os dados?')) return
    await fetch(`/api/companies?id=${id}`, { method: 'DELETE' })
    load()
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

  if (!user) return null

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Minhas Empresas</h1>
          <p className="text-sm text-zinc-500">{companies.length} empresa(s) cadastrada(s)</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white">
          <Plus size={16} /> Nova Empresa
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-4 flex flex-col sm:flex-row gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome da empresa" className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm" autoFocus />
          <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Meta mensal R$" type="number" className="w-40 rounded-xl border border-zinc-200 px-3 py-2 text-sm" />
          <button onClick={addCompany} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white">Criar</button>
          <button onClick={() => setShowAdd(false)} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm">Cancelar</button>
        </div>
      )}

      {companies.length > 0 && (
        <>
          {/* Company tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {companies.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium ${selected === c.id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Analytics */}
          {analytics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat title="Faturamento" value={`R$ ${analytics.totalRevenue?.toFixed(2)}`} color="text-blue-600" />
              <Stat title="Custos" value={`R$ ${analytics.totalCost?.toFixed(2)}`} color="text-red-600" />
              <Stat title="Lucro Líquido" value={`R$ ${analytics.totalProfit?.toFixed(2)}`} color={analytics.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
              <Stat title="Margem" value={`${analytics.totalMargin?.toFixed(1)}%`} color="text-purple-600" />
            </div>
          )}

          {/* Profit by product */}
          {analytics?.byProduct?.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5">
              <h3 className="text-sm font-semibold mb-3">Lucro por Produto</h3>
              <div className="space-y-2">
                {analytics.byProduct.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0 border-zinc-100 dark:border-zinc-700">
                    <span>{p.product}</span>
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

          {/* Products */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Produtos ({products.length})</h3>
              <button onClick={() => setShowProduct(true)} className="text-xs text-emerald-500 font-medium">+ Adicionar</button>
            </div>
            {showProduct && (
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} placeholder="Nome" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
                <input value={prodForm.sale_price} onChange={e => setProdForm({ ...prodForm, sale_price: e.target.value })} placeholder="Preço venda R$" type="number" className="w-32 rounded-xl border px-3 py-2 text-sm" />
                <input value={prodForm.cost_price} onChange={e => setProdForm({ ...prodForm, cost_price: e.target.value })} placeholder="Custo R$" type="number" className="w-32 rounded-xl border px-3 py-2 text-sm" />
                <button onClick={addProduct} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs text-white">Salvar</button>
              </div>
            )}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(p => {
                const margin = p.sale_price > 0 ? ((p.sale_price - p.cost_price) / p.sale_price) * 100 : 0
                return (
                  <div key={p.id} className="rounded-xl border border-zinc-100 dark:border-zinc-700 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-zinc-500">Venda R$ {p.sale_price} · Custo R$ {p.cost_price}</p>
                    </div>
                    <span className={`text-xs font-bold ${margin >= 30 ? 'text-emerald-600' : margin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                      {margin.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Sale */}
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Registrar Venda</h3>
              <button onClick={() => setShowSale(!showSale)} className="text-xs text-emerald-500 font-medium">{showSale ? 'Fechar' : '+ Nova'}</button>
            </div>
            {showSale && (
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                <select value={saleForm.productId} onChange={e => { const p = products.find(x => x.id === e.target.value); setSaleForm({ ...saleForm, productId: e.target.value, sale_price: String(p?.sale_price || ''), cost_price: String(p?.cost_price || '') }) }} className="rounded-xl border px-3 py-2 text-sm">
                  <option value="">Produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input value={saleForm.quantity} onChange={e => setSaleForm({ ...saleForm, quantity: e.target.value })} placeholder="Qtd" type="number" className="w-16 rounded-xl border px-3 py-2 text-sm" />
                <input value={saleForm.sale_price} onChange={e => setSaleForm({ ...saleForm, sale_price: e.target.value })} placeholder="Preço R$" type="number" className="w-28 rounded-xl border px-3 py-2 text-sm" />
                <input value={saleForm.sale_date} onChange={e => setSaleForm({ ...saleForm, sale_date: e.target.value })} type="date" className="rounded-xl border px-3 py-2 text-sm" />
                <button onClick={addSale} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm text-white">Registrar</button>
              </div>
            )}
          </div>

          {/* Remove company */}
          <div className="flex justify-end">
            <button onClick={() => removeCompany(selected!)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
              <Trash2 size={12} /> Excluir esta empresa
            </button>
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
    <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  )
}

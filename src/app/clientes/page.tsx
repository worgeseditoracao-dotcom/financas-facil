'use client'

import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Users, Package, TrendingUp, TrendingDown, DollarSign, Target, Monitor, Users2, Settings, BarChart3, AlertTriangle, PieChart } from 'lucide-react'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import type { Client, BusinessProduct, BusinessInfo } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function BusinessPage() {
  const { state, addClient, updateClient, deleteClient, addBusinessProduct, updateBusinessProduct, deleteBusinessProduct, updateBusinessInfo } = useStore()
  const [clientsTab, setClientsTab] = useState(true)
  const [showClientForm, setShowClientForm] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState<BusinessProduct | null>(null)

  const info = state.businessInfo[0]
  const [adsCost, setAdsCost] = useState(info?.monthlyAds ? String(info.monthlyAds) : '')
  const [serversCost, setServersCost] = useState(info?.monthlyServers ? String(info.monthlyServers) : '')
  const [employeesCost, setEmployeesCost] = useState(info?.monthlyEmployees ? String(info.monthlyEmployees) : '')
  const [otherCosts, setOtherCosts] = useState(info?.otherCosts ? String(info.otherCosts) : '')

  const revenue = state.transactions.filter(t => t.module === 'business' && t.type === 'income').reduce((a, t) => a + t.value, 0)
  const expenses = state.transactions.filter(t => t.module === 'business' && t.type === 'expense').reduce((a, t) => a + Math.abs(t.value), 0)
  const profit = revenue - expenses
  const margin = revenue > 0 ? ((profit / revenue) * 100) : 0

  const totalProductRevenue = state.businessProducts.reduce((a, p) => a + p.price, 0)
  const totalProductCost = state.businessProducts.reduce((a, p) => a + p.cost, 0)
  const totalProductProfit = totalProductRevenue - totalProductCost

  const totalFixedCosts = (parseFloat(adsCost) || 0) + (parseFloat(serversCost) || 0) + (parseFloat(employeesCost) || 0) + (parseFloat(otherCosts) || 0)

  const activeClients = state.clients.filter(c => c.status === 'active')
  const totalClients = state.clients.length
  const ticketMedio = activeClients.length > 0 ? revenue / activeClients.length : 0
  const clientesInadimplentes = state.clients.filter(c => c.status === 'active').length // clients who owe something
  const totalInvoiceValues = state.receivables.filter(r => !r.received).reduce((a, r) => a + r.value, 0)
  const inadimplencia = revenue > 0 ? (totalInvoiceValues / revenue) * 100 : 0
  const totalOperationalCosts = (parseFloat(adsCost) || 0) + (parseFloat(serversCost) || 0) + (parseFloat(employeesCost) || 0) + (parseFloat(otherCosts) || 0)
  const totalBusinessExpenses = expenses + totalOperationalCosts + state.businessProducts.reduce((a, p) => a + p.cost, 0)
  const roi = totalBusinessExpenses > 0 ? ((revenue - totalBusinessExpenses) / totalBusinessExpenses) * 100 : 0
  const cac = activeClients.length > 0 ? totalBusinessExpenses / activeClients.length : 0
  const ltv = activeClients.length > 0 ? revenue / activeClients.length : 0

  const handleSaveCosts = () => {
    updateBusinessInfo({
      id: 'main',
      monthlyAds: parseFloat(adsCost) || 0,
      monthlyServers: parseFloat(serversCost) || 0,
      monthlyEmployees: parseFloat(employeesCost) || 0,
      otherCosts: parseFloat(otherCosts) || 0,
    })
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Empresa</h1>
          <p className="mt-1 text-sm text-zinc-500">Gestão completa do seu negócio</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Receita Total</span>
          </div>
          <p className="text-lg font-bold text-emerald-500">{formatCurrency(revenue)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-500" />
            <span className="text-xs font-medium text-zinc-500">Despesas</span>
          </div>
          <p className="text-lg font-bold text-red-500">{formatCurrency(expenses)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-zinc-500">Lucro</span>
          </div>
          <p className={`text-lg font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(profit)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-emerald-500" />
            <span className="text-xs font-medium text-zinc-500">Margem</span>
          </div>
          <p className={`text-lg font-bold ${margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={18} className="text-emerald-500" />
          <h2 className="text-base font-semibold text-zinc-900">Indicadores</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div className="rounded-xl bg-emerald-500/5 p-3">
            <span className="text-[10px] font-medium text-zinc-500">Ticket Médio</span>
            <p className="text-sm font-bold text-emerald-500 mt-0.5">{formatCurrency(ticketMedio)}</p>
          </div>
          <div className="rounded-xl bg-red-500/5 p-3">
            <span className="text-[10px] font-medium text-zinc-500">Inadimplência</span>
            <p className={`text-sm font-bold mt-0.5 ${inadimplencia > 5 ? 'text-red-500' : 'text-emerald-500'}`}>{inadimplencia.toFixed(1)}%</p>
          </div>
          <div className="rounded-xl bg-blue-500/5 p-3">
            <span className="text-[10px] font-medium text-zinc-500">ROI</span>
            <p className={`text-sm font-bold mt-0.5 ${roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{roi.toFixed(1)}%</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <span className="text-[10px] font-medium text-zinc-500">CAC</span>
            <p className="text-sm font-bold text-zinc-900 mt-0.5">{formatCurrency(cac)}</p>
          </div>
          <div className="rounded-xl bg-purple-500/5 p-3">
            <span className="text-[10px] font-medium text-zinc-500">LTV</span>
            <p className="text-sm font-bold text-purple-500 mt-0.5">{formatCurrency(ltv)}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <span className="text-[10px] font-medium text-zinc-500">Clientes Ativos</span>
            <p className="text-sm font-bold text-zinc-900 mt-0.5">{activeClients.length}/{totalClients}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 p-3">
            <span className="text-[10px] font-medium text-zinc-500">LTV/CAC</span>
            <p className={`text-sm font-bold mt-0.5 ${cac > 0 && ltv / cac >= 3 ? 'text-emerald-500' : 'text-zinc-900'}`}>
              {cac > 0 ? (ltv / cac).toFixed(1) + 'x' : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3">
            <span className="text-[10px] font-medium text-zinc-500">Margem Líquida</span>
            <p className={`text-sm font-bold mt-0.5 ${margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{margin.toFixed(1)}%</p>
          </div>
        </div>
        {inadimplencia > 5 && (
          <div className="mt-3 rounded-xl bg-orange-500/5 border border-orange-500/20 p-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-orange-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-600">
              Inadimplência de {inadimplencia.toFixed(1)}% — acima dos 5% recomendados. Considere ações de cobrança.
            </p>
          </div>
        )}
      </div>

      {/* Custos Fixos */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-emerald-500" />
          <h2 className="text-base font-semibold text-zinc-900">Custos Operacionais</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">Anúncios (Ads)</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
              <input type="number" value={adsCost} onChange={e => setAdsCost(e.target.value)} placeholder="0"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-7 pr-2 text-sm text-zinc-900" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">Servidores</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
              <input type="number" value={serversCost} onChange={e => setServersCost(e.target.value)} placeholder="0"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-7 pr-2 text-sm text-zinc-900" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">Funcionários</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
              <input type="number" value={employeesCost} onChange={e => setEmployeesCost(e.target.value)} placeholder="0"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-7 pr-2 text-sm text-zinc-900" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">Outros Custos</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">R$</span>
              <input type="number" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} placeholder="0"
                className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-7 pr-2 text-sm text-zinc-900" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-zinc-500">Total custos fixos: <strong className="text-zinc-900">{formatCurrency(totalFixedCosts)}</strong></span>
          <Button size="sm" onClick={handleSaveCosts}>Salvar Custos</Button>
        </div>
      </div>

      {/* Produtos/Serviços */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">Produtos & Serviços</h2>
          </div>
          <Button size="sm" onClick={() => setShowProductForm(true)}><Plus size={14} /> Novo</Button>
        </div>
        {state.businessProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-emerald-500/5 p-2 text-xs">
              <span className="text-zinc-500">Preço Total</span>
              <p className="font-bold text-emerald-500">{formatCurrency(totalProductRevenue)}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 p-2 text-xs">
              <span className="text-zinc-500">Lucro Total</span>
              <p className="font-bold text-zinc-900">{formatCurrency(totalProductProfit)}</p>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {state.businessProducts.map(p => {
            const lucro = p.price - p.cost
            const pct = p.price > 0 ? ((lucro / p.price) * 100).toFixed(0) : '0'
            return (
              <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 group">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-500">{p.category} · Custo: {formatCurrency(p.cost)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-emerald-500">{formatCurrency(p.price)}</span>
                  <span className={`text-xs font-medium ${lucro >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{pct}%</span>
                  <button onClick={() => { setEditProduct(p); setShowProductForm(true) }} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"><Pencil size={12} /></button>
                  <button onClick={() => deleteBusinessProduct(p.id)} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
            )
          })}
          {state.businessProducts.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Nenhum produto cadastrado. Adicione seus produtos ou serviços.</p>
          )}
        </div>
      </div>

      {/* Clientes */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            <h2 className="text-base font-semibold text-zinc-900">Clientes</h2>
          </div>
          <Button size="sm" onClick={() => setShowClientForm(true)}><Plus size={14} /> Novo</Button>
        </div>
        {activeClients.length > 0 && (
          <p className="text-xs text-zinc-500 mb-3">{activeClients.length} cliente(s) ativo(s)</p>
        )}
        <div className="space-y-2">
          {state.clients.map(client => (
            <div key={client.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 border border-zinc-200 group">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-200 text-zinc-500'}`}>
                  <Users size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{client.name}</p>
                  <p className="text-xs text-zinc-500">{client.service || '—'} · {client.status === 'active' ? 'Ativo' : 'Inativo'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {client.value && <span className="text-sm font-bold text-zinc-900">{formatCurrency(client.value)}</span>}
                <button onClick={() => { setEditClient(client); setShowClientForm(true) }} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100"><Pencil size={12} /></button>
                <button onClick={() => deleteClient(client.id)} className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-red-500"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {state.clients.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Nenhum cliente cadastrado.</p>
          )}
        </div>
      </div>

      {showClientForm && <ClientForm client={editClient} onSave={(data) => { editClient ? (updateClient({ ...editClient, ...data }), setEditClient(null)) : addClient(data); setShowClientForm(false); setEditClient(null) }} onClose={() => { setShowClientForm(false); setEditClient(null) }} />}
      {showProductForm && <ProductForm product={editProduct} onSave={(data) => { editProduct ? (updateBusinessProduct({ ...editProduct, ...data }), setEditProduct(null)) : addBusinessProduct(data); setShowProductForm(false); setEditProduct(null) }} onClose={() => { setShowProductForm(false); setEditProduct(null) }} />}
    </div>
  )
}

function ClientForm({ client, onSave, onClose }: {
  client?: Client | null
  onSave: (data: Omit<Client, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(client?.name || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [email, setEmail] = useState(client?.email || '')
  const [service, setService] = useState(client?.service || '')
  const [value, setValue] = useState(client?.value ? String(client.value) : '')
  const [status, setStatus] = useState<'active' | 'inactive'>(client?.status || 'active')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onSave({ name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, service: service.trim() || undefined, value: parseFloat(value) || undefined, status })
  }

  return (
    <Modal title={client ? 'Editar Cliente' : 'Novo Cliente'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <div className="flex gap-2">
          <Input label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} className="flex-1" />
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" />
        </div>
        <Input label="Serviço/Produto" placeholder="Ex: Consultoria" value={service} onChange={e => setService(e.target.value)} />
        <Input label="Valor (R$)" type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setStatus('active')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${status === 'active' ? 'bg-emerald-500 text-black' : 'bg-zinc-200 text-zinc-500'}`}>Ativo</button>
          <button type="button" onClick={() => setStatus('inactive')} className={`flex-1 rounded-xl py-2 text-sm font-medium ${status === 'inactive' ? 'bg-red-500 text-white' : 'bg-zinc-200 text-zinc-500'}`}>Inativo</button>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{client ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function ProductForm({ product, onSave, onClose }: {
  product?: BusinessProduct | null
  onSave: (data: Omit<BusinessProduct, 'id' | 'createdAt'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [cost, setCost] = useState(product ? String(product.cost) : '')
  const [category, setCategory] = useState(product?.category || 'product')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return
    onSave({ name: name.trim(), description: description.trim() || undefined, price: Math.abs(parseFloat(price)), cost: Math.abs(parseFloat(cost) || 0), category: category as 'product' | 'service' | 'digital' })
  }

  return (
    <Modal title={product ? 'Editar Produto' : 'Novo Produto'} onClose={onClose} open>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <Input label="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="flex gap-2">
          <Input label="Preço de Venda (R$)" type="number" step="0.01" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} required />
          <Input label="Custo (R$)" type="number" step="0.01" placeholder="0,00" value={cost} onChange={e => setCost(e.target.value)} />
        </div>
        {price && cost && (
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 text-sm">
            <span className="text-zinc-500">Lucro: </span>
            <span className="font-bold text-emerald-500">{formatCurrency(parseFloat(price) - parseFloat(cost))}</span>
            <span className="text-zinc-500"> ({(parseFloat(price) > 0 ? (((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) * 100).toFixed(0) : 0)}%)</span>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-500">Tipo</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900">
            <option value="product">Produto Físico</option>
            <option value="service">Serviço</option>
            <option value="digital">Produto Digital</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1">{product ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Modal>
  )
}

import { supabase } from './supabase'
import { v4 as uuid } from 'uuid'

export interface Company {
  id: string
  user_id: string
  name: string
  type: string
  monthly_revenue_target: number
  created_at: string
  updated_at: string
}

export interface BusinessProduct {
  id: string
  company_id: string
  user_id: string
  name: string
  description: string
  sale_price: number
  cost_price: number
  category: string
  active: boolean
  created_at: string
}

export interface ProductSale {
  id: string
  company_id: string
  product_id: string
  user_id: string
  quantity: number
  sale_price: number
  cost_price: number
  sale_date: string
  client_name: string
  notes: string
  created_at: string
}

export async function getCompanies(userId: string): Promise<Company[]> {
  const { data } = await supabase.from('companies').select('*').eq('user_id', userId).order('created_at', { ascending: true })
  return data || []
}

export async function createCompany(data: { user_id: string; name: string; monthly_revenue_target?: number }): Promise<Company> {
  const now = new Date().toISOString()
  const company: Company = {
    id: uuid(),
    user_id: data.user_id,
    name: data.name,
    type: 'business',
    monthly_revenue_target: data.monthly_revenue_target || 0,
    created_at: now,
    updated_at: now,
  }
  const { data: result, error } = await supabase.from('companies').insert(company).select().single()
  if (error) throw new Error(error.message)
  return result
}

export async function deleteCompany(id: string) {
  await supabase.from('product_sales').delete().eq('company_id', id)
  await supabase.from('business_products').delete().eq('company_id', id)
  await supabase.from('companies').delete().eq('id', id)
}

export async function getProducts(companyId: string): Promise<BusinessProduct[]> {
  const { data } = await supabase.from('business_products').select('*').eq('company_id', companyId).order('created_at', { ascending: false })
  return data || []
}

export async function createProduct(data: { company_id: string; user_id: string; name: string; sale_price: number; cost_price: number; category?: string }): Promise<BusinessProduct> {
  const product: BusinessProduct = {
    id: uuid(),
    company_id: data.company_id,
    user_id: data.user_id,
    name: data.name,
    description: '',
    sale_price: data.sale_price,
    cost_price: data.cost_price,
    category: data.category || 'product',
    active: true,
    created_at: new Date().toISOString(),
  }
  const { data: result, error } = await supabase.from('business_products').insert(product).select().single()
  if (error) throw new Error(error.message)
  return result
}

export async function deleteProduct(id: string) {
  await supabase.from('product_sales').delete().eq('product_id', id)
  await supabase.from('business_products').delete().eq('id', id)
}

export async function getSales(companyId: string): Promise<ProductSale[]> {
  const { data } = await supabase.from('product_sales').select('*').eq('company_id', companyId).order('sale_date', { ascending: false })
  return data || []
}

export async function createSale(data: { company_id: string; product_id: string; user_id: string; quantity?: number; sale_price: number; cost_price: number; sale_date: string; client_name?: string }): Promise<ProductSale> {
  const sale: ProductSale = {
    id: uuid(),
    company_id: data.company_id,
    product_id: data.product_id,
    user_id: data.user_id,
    quantity: data.quantity || 1,
    sale_price: data.sale_price,
    cost_price: data.cost_price,
    sale_date: data.sale_date,
    client_name: data.client_name || '',
    notes: '',
    created_at: new Date().toISOString(),
  }
  const { data: result, error } = await supabase.from('product_sales').insert(sale).select().single()
  if (error) throw new Error(error.message)
  return result
}

export async function getCompanyAnalytics(companyId: string) {
  const sales = await getSales(companyId)
  const products = await getProducts(companyId)

  let totalRevenue = 0
  let totalCost = 0
  let totalProfit = 0
  const byProduct: Record<string, { product: string; revenue: number; cost: number; profit: number; margin: number; quantity: number }> = {}

  for (const s of sales) {
    const rev = s.sale_price * s.quantity
    const cost = s.cost_price * s.quantity
    const profit = rev - cost
    totalRevenue += rev
    totalCost += cost
    totalProfit += profit

    const productName = products.find(p => p.id === s.product_id)?.name || 'Produto'
    if (!byProduct[s.product_id]) byProduct[s.product_id] = { product: productName, revenue: 0, cost: 0, profit: 0, margin: 0, quantity: 0 }
    byProduct[s.product_id].revenue += rev
    byProduct[s.product_id].cost += cost
    byProduct[s.product_id].profit += profit
    byProduct[s.product_id].quantity += s.quantity
  }

  for (const p of Object.values(byProduct)) {
    p.margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
  }

  const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  return {
    totalRevenue, totalCost, totalProfit, totalMargin,
    byProduct: Object.values(byProduct).sort((a, b) => b.profit - a.profit),
    productCount: products.length,
    saleCount: sales.length,
  }
}

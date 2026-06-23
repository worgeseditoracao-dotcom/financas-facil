import { supabase } from './supabase'

export interface Insight {
  id: string
  type: 'danger' | 'warning' | 'success' | 'info'
  category: 'savings' | 'spending' | 'profit' | 'goal' | 'trend' | 'tip'
  title: string
  message: string
  suggestion: string
  impact: string
  created_at: string
}

export async function generateInsights(userId: string, companyId?: string): Promise<Insight[]> {
  const insights: Insight[] = []
  const now = new Date().toISOString()

  // Buscar transações de receita/despesa
  // Usando o store local + dados do Supabase
  let whereClause = `user_id.eq.${userId}`
  if (companyId) whereClause = `company_id.eq.${companyId}`

  // Análise de vendas de produtos
  const { data: sales } = await supabase.from('product_sales').select('*').eq('user_id', userId).order('sale_date', { ascending: true })
  const { data: products } = await supabase.from('business_products').select('*').eq('user_id', userId)

  // Análise de compras (gastos) - da tabela de transações local
  const { data: purchases } = await supabase.from('purchases').select('*').eq('user_id', userId)

  // 1. Análise de lucro por produto
  if (sales && sales.length > 0 && products && products.length > 0) {
    const bestProduct = findBestProduct(sales, products)
    const worstProduct = findWorstProduct(sales, products)

    if (bestProduct && bestProduct.profit > 0) {
      insights.push({
        id: `insight-profit-${Date.now()}`,
        type: 'success',
        category: 'profit',
        title: '🏆 Produto campeão',
        message: `"${bestProduct.name}" é seu produto mais lucrativo com R$ ${bestProduct.profit.toFixed(2)} de lucro total e ${bestProduct.margin.toFixed(0)}% de margem.`,
        suggestion: 'Invista mais na divulgação deste produto. Considere criar produtos complementares.',
        impact: 'Foco no que gera mais resultado',
        created_at: now,
      })
    }

    if (worstProduct && worstProduct.profit <= 0) {
      insights.push({
        id: `insight-loss-${Date.now()}`,
        type: 'danger',
        category: 'spending',
        title: '⚠️ Produto no prejuízo',
        message: `"${worstProduct.name}" está com margem negativa (${worstProduct.margin.toFixed(0)}%). Você está perdendo R$ ${Math.abs(worstProduct.profit).toFixed(2)} com ele.`,
        suggestion: 'Reavalie o preço de venda ou negocie o custo com fornecedores.',
        impact: `Potencial de +R$ ${Math.abs(worstProduct.profit).toFixed(2)} se corrigido`,
        created_at: now,
      })
    }

    // Margem média
    const avgMargin = calculateAvgMargin(sales, products)
    if (avgMargin < 20) {
      insights.push({
        id: `insight-margin-${Date.now()}`,
        type: 'warning',
        category: 'profit',
        title: '📊 Margem baixa',
        message: `Sua margem de lucro média é de apenas ${avgMargin.toFixed(0)}%. O ideal é acima de 30%.`,
        suggestion: 'Analise cada produto: aumente preços onde possível e reduza custos operacionais.',
        impact: `Se subir para 30%, ganharia +R$ ${estimateGain(sales, avgMargin, 30).toFixed(2)}`,
        created_at: now,
      })
    }
  }

  // 2. Dica de precificação
  if (products && products.length > 0) {
    const lowMarginProducts = products.filter(p => {
      const productSales = (sales || []).filter(s => s.product_id === p.id)
      if (productSales.length === 0) return false
      const margin = ((p.sale_price - p.cost_price) / p.sale_price) * 100
      return margin < 30
    })

    if (lowMarginProducts.length > 0) {
      insights.push({
        id: `insight-pricing-${Date.now()}`,
        type: 'warning',
        category: 'profit',
        title: '💰 Precificação melhorável',
        message: `${lowMarginProducts.length} produto(s) têm margem abaixo de 30%. São eles: ${lowMarginProducts.map(p => p.name).join(', ')}.`,
        suggestion: 'Use a fórmula: Preço = Custo × 2 (margem 50%) ou Custo × 1,7 (margem 41%).',
        impact: 'Aumentar margens é o caminho mais rápido para o lucro',
        created_at: now,
      })
    }
  }

  // 3. Sazonalidade / tendência
  if (sales && sales.length >= 3) {
    const trend = analyzeTrend(sales)
    if (trend === 'up') {
      insights.push({
        id: `insight-trend-up-${Date.now()}`,
        type: 'success',
        category: 'trend',
        title: '📈 Crescimento detectado',
        message: 'Suas vendas estão em tendência de alta nos últimos períodos!',
        suggestion: 'Este é o momento de reinvestir no negócio. Considere expandir seu mix de produtos.',
        impact: 'Continue o bom trabalho',
        created_at: now,
      })
    } else if (trend === 'down') {
      insights.push({
        id: `insight-trend-down-${Date.now()}`,
        type: 'warning',
        category: 'trend',
        title: '📉 Queda nas vendas',
        message: 'Suas vendas estão em queda nos últimos períodos.',
        suggestion: 'Intensifique divulgação, ofereça promoções ou crie combos de produtos.',
        impact: 'Uma ação agora pode reverter a tendência',
        created_at: now,
      })
    }
  }

  // 4. Dica de economia / meta
  if (purchases && purchases.length > 0) {
    const totalSpent = purchases.reduce((a, p) => a + Number(p.amount), 0)
    if (totalSpent > 0) {
      const monthlyAvg = totalSpent / Math.max(1, purchases.length)
      insights.push({
        id: `insight-saving-${Date.now()}`,
        type: 'info',
        category: 'savings',
        title: '🎯 Dica de economia',
        message: `Seu gasto médio por transação é de R$ ${(monthlyAvg).toFixed(2)}.`,
        suggestion: 'Separe 10% de cada receita para uma reserva de emergência. Pequenos valores viram grandes somas.',
        impact: `Guardando 10% = R$ ${(totalSpent * 0.1).toFixed(2)} economizados`,
        created_at: now,
      })
    }
  }

  // 5. Dica geral de saúde financeira
  if (sales && sales.length > 0 && purchases && purchases.length > 0) {
    const totalRevenue = sales.reduce((a, s) => a + s.sale_price * s.quantity, 0)
    const totalPurchases = purchases.reduce((a, p) => a + Number(p.amount), 0)
    const healthRatio = totalRevenue / Math.max(1, totalPurchases)

    if (healthRatio > 2) {
      insights.push({
        id: `insight-health-${Date.now()}`,
        type: 'success',
        category: 'tip',
        title: '💪 Saúde financeira excelente',
        message: `Você gera R$ ${healthRatio.toFixed(1)} de receita para cada R$ 1,00 de gasto. Ótimo equilíbrio!`,
        suggestion: 'Considere investir o excedente para fazer o dinheiro trabalhar por você.',
        impact: 'Você está no caminho certo',
        created_at: now,
      })
    } else if (healthRatio < 1.5) {
      insights.push({
        id: `insight-health-${Date.now()}`,
        type: 'danger',
        category: 'tip',
        title: '🚨 Atenção ao equilíbrio',
        message: `Você gera apenas R$ ${healthRatio.toFixed(1)} para cada R$ 1,00 gasto. Sua margem está apertada.`,
        suggestion: 'Reduza custos ou aumente preços. O ideal é faturar pelo menos 2x seus custos.',
        impact: 'Pequenos ajustes geram grande impacto',
        created_at: now,
      })
    }
  }

  return insights.slice(0, 6)
}

function findBestProduct(sales: any[], products: any[]) {
  const byProduct: Record<string, { name: string; profit: number; margin: number }> = {}
  for (const s of sales) {
    const prod = products.find(p => p.id === s.product_id)
    if (!prod) continue
    if (!byProduct[s.product_id]) byProduct[s.product_id] = { name: prod.name, profit: 0, margin: 0 }
    byProduct[s.product_id].profit += (s.sale_price - s.cost_price) * s.quantity
  }
  const entries = Object.values(byProduct)
  if (!entries.length) return null
  const totalRevenue = sales.reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
  for (const e of entries) {
    const rev = sales.filter((s: any) => products.find(p => p.id === s.product_id)?.name === e.name)
      .reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
    e.margin = rev > 0 ? (e.profit / rev) * 100 : 0
  }
  return entries.sort((a, b) => b.profit - a.profit)[0]
}

function findWorstProduct(sales: any[], products: any[]) {
  const byProduct: Record<string, { name: string; profit: number; margin: number }> = {}
  for (const s of sales) {
    const prod = products.find(p => p.id === s.product_id)
    if (!prod) continue
    if (!byProduct[s.product_id]) byProduct[s.product_id] = { name: prod.name, profit: 0, margin: 0 }
    byProduct[s.product_id].profit += (s.sale_price - s.cost_price) * s.quantity
  }
  const entries = Object.values(byProduct)
  if (!entries.length) return null
  const totalRevenue = sales.reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
  for (const e of entries) {
    const rev = sales.filter((s: any) => products.find(p => p.id === s.product_id)?.name === e.name)
      .reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
    e.margin = rev > 0 ? (e.profit / rev) * 100 : 0
  }
  return entries.sort((a, b) => a.profit - b.profit)[0]
}

function calculateAvgMargin(sales: any[], products: any[]): number {
  let totalRev = 0, totalCost = 0
  for (const s of sales) {
    totalRev += s.sale_price * s.quantity
    totalCost += s.cost_price * s.quantity
  }
  return totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0
}

function estimateGain(sales: any[], currentMargin: number, targetMargin: number): number {
  const totalRev = sales.reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
  const currentProfit = totalRev * (currentMargin / 100)
  const targetProfit = totalRev * (targetMargin / 100)
  return targetProfit - currentProfit
}

function analyzeTrend(sales: any[]): 'up' | 'down' | 'stable' {
  if (sales.length < 2) return 'stable'
  const mid = Math.floor(sales.length / 2)
  const first = sales.slice(0, mid).reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
  const second = sales.slice(mid).reduce((a: number, s: any) => a + s.sale_price * s.quantity, 0)
  const diff = ((second - first) / Math.max(1, first)) * 100
  if (diff > 10) return 'up'
  if (diff < -10) return 'down'
  return 'stable'
}

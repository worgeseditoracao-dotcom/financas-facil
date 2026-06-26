import { NextRequest, NextResponse } from 'next/server'

interface InsightData {
  transactions?: any[]
  bills?: any[]
  receivables?: any[]
  sales?: { sale_price: number; cost_price: number; quantity: number; product_name: string }[]
  purchases?: { amount: number }[]
  totalRevenue?: number
  totalExpenses?: number
}

export async function POST(req: NextRequest) {
  try {
    const data: InsightData = await req.json()
    const insights: any[] = []
    const now = new Date().toISOString()

    const transactions = data.transactions || []
    const bills = data.bills || []
    const receivables = data.receivables || []
    const sales = data.sales || []
    const purchases = data.purchases || []

    const totalRevenue = data.totalRevenue || transactions.filter((t: any) => t.type === 'income').reduce((a: number, t: any) => a + Math.abs(t.value), 0)
    const totalExpenses = data.totalExpenses || transactions.filter((t: any) => t.type === 'expense').reduce((a: number, t: any) => a + Math.abs(t.value), 0)

    // 1. Economia
    const savingsRate = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
    if (totalRevenue > 0) {
      if (savingsRate >= 30) {
        insights.push({ id: `${Date.now()}-save`, type: 'success', category: 'savings', title: '💰 Excelente taxa de economia', message: `Você está economizando ${savingsRate.toFixed(0)}% da sua receita. Continue assim!`, suggestion: 'Considere investir o excedente para fazer o dinheiro render.', impact: 'Você está acima da média brasileira (20%)', created_at: now })
      } else if (savingsRate < 10 && totalRevenue > 1000) {
        insights.push({ id: `${Date.now()}-save2`, type: 'warning', category: 'savings', title: '⚠️ Taxa de economia baixa', message: `Você economiza apenas ${savingsRate.toFixed(0)}% da sua receita.`, suggestion: 'Tente separar pelo menos 20% da receita para poupança ou investimentos.', impact: `Economizando 20% = R$ ${(totalRevenue * 0.2).toFixed(2)}/mês`, created_at: now })
      }
    }

    // 2. Gastos por categoria
    const byCategory: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type === 'expense') {
        const cat = t.category || 'Outros'
        byCategory[cat] = (byCategory[cat] || 0) + Math.abs(t.value)
      }
    }
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
    if (sorted.length > 0 && sorted[0][1] > totalExpenses * 0.5) {
      insights.push({
        id: `${Date.now()}-cat`,
        type: 'warning',
        category: 'spending',
        title: `📊 Maior gasto: ${sorted[0][0]}`,
        message: `${sorted[0][0]} representa ${((sorted[0][1] / Math.max(1, totalExpenses)) * 100).toFixed(0)}% dos seus gastos.`,
        suggestion: `Analise se há como reduzir gastos com ${sorted[0][0]}. Pequenas reduções geram grande economia.`,
        impact: `Reduzindo 20% = economia de R$ ${(sorted[0][1] * 0.2).toFixed(2)}`,
        created_at: now,
      })
    }

    // 3. Contas vencidas
    const overdueBills = bills.filter((b: any) => !b.paid && b.dueDate < new Date().toISOString().split('T')[0])
    if (overdueBills.length > 0) {
      const totalOverdue = overdueBills.reduce((a: number, b: any) => a + b.value, 0)
      insights.push({
        id: `${Date.now()}-overdue`,
        type: 'danger',
        category: 'spending',
        title: `🚨 ${overdueBills.length} conta(s) vencida(s)`,
        message: `Total de R$ ${totalOverdue.toFixed(2)} em contas atrasadas.`,
        suggestion: 'Regularize o quanto antes para evitar juros e manter seu nome limpo.',
        impact: 'Juros de atraso podem chegar a 10% ao mês',
        created_at: now,
      })
    }

    // 4. Receita vs meta
    const paidBills = bills.filter((b: any) => b.paid).reduce((a: number, b: any) => a + b.value, 0)
    const receivedAmount = receivables.filter((r: any) => r.received).reduce((a: number, r: any) => a + r.value, 0)
    const netFlow = totalRevenue + receivedAmount - totalExpenses - paidBills

    if (netFlow > 0) {
      insights.push({
        id: `${Date.now()}-flow`,
        type: 'success',
        category: 'trend',
        title: '📈 Fluxo positivo',
        message: `Seu fluxo de caixa está positivo em R$ ${netFlow.toFixed(2)}.`,
        suggestion: 'Este é o momento ideal para investir ou criar uma reserva de emergência.',
        impact: 'Fluxo positivo é sinal de saúde financeira',
        created_at: now,
      })
    } else if (netFlow < 0 && totalRevenue > 0) {
      insights.push({
        id: `${Date.now()}-flow2`,
        type: 'danger',
        category: 'trend',
        title: '📉 Gastando mais do que ganha',
        message: `Seu fluxo está negativo em R$ ${Math.abs(netFlow).toFixed(2)}.`,
        suggestion: 'Revise seus gastos e corte o que não for essencial.',
        impact: 'Gastar mais do que ganha compromete o futuro',
        created_at: now,
      })
    }

    // 5. Dica de reserva
    if (totalRevenue > 0 && !insights.some(i => i.category === 'goal')) {
      insights.push({
        id: `${Date.now()}-reserve`,
        type: 'info',
        category: 'goal',
        title: '🎯 Crie sua reserva de emergência',
        message: 'O ideal é ter de 3 a 6 meses de gastos guardados.',
        suggestion: `Comece guardando R$ ${(totalExpenses * 0.1).toFixed(2)} por mês (10% dos gastos).`,
        impact: `Em 1 ano = R$ ${(totalExpenses * 0.1 * 12).toFixed(2)}`,
        created_at: now,
      })
    }

    return NextResponse.json({ insights: insights.slice(0, 6) })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

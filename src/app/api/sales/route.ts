import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'
import { getSales, createSale } from '@/lib/companies'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 })

  const sales = await getSales(companyId)
  return NextResponse.json({ sales })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { companyId, productId, sale_price, cost_price, sale_date, quantity, client_name } = await req.json()
  if (!companyId || !productId || !sale_price || !sale_date) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })

  const sale = await createSale({
    company_id: companyId, product_id: productId, user_id: userId,
    sale_price: Number(sale_price), cost_price: Number(cost_price || 0),
    sale_date, quantity: quantity || 1, client_name: client_name || '',
  })
  return NextResponse.json({ ok: true, sale })
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'
import { getProducts, createProduct, deleteProduct } from '@/lib/companies'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 })

  const products = await getProducts(companyId)
  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { companyId, name, sale_price, cost_price, category } = await req.json()
  if (!companyId || !name || !sale_price) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })

  const product = await createProduct({ company_id: companyId, user_id: userId, name, sale_price: Number(sale_price), cost_price: Number(cost_price || 0), category })
  return NextResponse.json({ ok: true, product })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await deleteProduct(id)
  return NextResponse.json({ ok: true })
}

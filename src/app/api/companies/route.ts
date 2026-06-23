import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { findUserById } from '@/lib/db'
import { verifySessionToken } from '@/lib/auth'
import { getCompanies, createCompany, deleteCompany, getCompanyAnalytics } from '@/lib/companies'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const companyId = searchParams.get('companyId')

  if (action === 'analytics' && companyId) {
    const analytics = await getCompanyAnalytics(companyId)
    return NextResponse.json(analytics)
  }

  const companies = await getCompanies(userId)
  return NextResponse.json({ companies })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { name, monthly_revenue_target } = await req.json()
  if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

  const company = await createCompany({ user_id: userId, name, monthly_revenue_target })
  return NextResponse.json({ ok: true, company })
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await deleteCompany(id)
  return NextResponse.json({ ok: true })
}

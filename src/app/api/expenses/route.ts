import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { v4 as uuid } from 'uuid'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'companyId obrigatório' }, { status: 400 })

  const { data } = await supabase.from('company_expenses').select('*').eq('company_id', companyId).order('expense_date', { ascending: false })
  return NextResponse.json({ expenses: data || [] })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { companyId, name, value, category, expense_date } = await req.json()
  if (!companyId || !name || !value) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 })

  const { data, error } = await supabase.from('company_expenses').insert({
    id: uuid(), company_id: companyId, user_id: userId,
    name, value: Math.abs(Number(value)), category: category || 'Operacional',
    expense_date: expense_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, expense: data })
}

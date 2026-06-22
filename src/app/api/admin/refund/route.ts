import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { caktoRefundOrder } from '@/lib/cakto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

    // Buscar usuário
    const { data: users } = await supabase.from('users').select('*').eq('email', email.toLowerCase())
    if (!users?.length) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const user = users[0]

    // Buscar compra mais recente do usuário
    const { data: purchases } = await supabase.from('purchases').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)

    let refundResult: any = null
    if (purchases?.length) {
      const purchase = purchases[0]
      // Se foi pago via Cakto, chama a API de reembolso
      if (purchase.transaction_id) {
        try {
          refundResult = await caktoRefundOrder(purchase.transaction_id)
        } catch {
          refundResult = { success: false, message: 'Erro ao conectar com a Cakto' }
        }
      }
    }

    // Bloquear usuário
    await supabase.from('users').update({
      access_status: 'blocked',
      blocked_reason: 'reembolso_manual_admin',
      blocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    return NextResponse.json({
      ok: true,
      message: 'Usuário bloqueado e reembolso solicitado',
      refund: refundResult?.message || 'Reembolso processado',
      user: { id: user.id, email: user.email, access_status: 'blocked' },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

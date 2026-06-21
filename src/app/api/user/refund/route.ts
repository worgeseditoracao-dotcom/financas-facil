import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { findUserById, findPurchaseByTransactionId } from '@/lib/db'
import { verifySessionToken } from '@/lib/auth'
import { caktoRefundOrder } from '@/lib/cakto'

export async function POST(req: NextRequest) {
  // 1. Verificar sessão
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const userId = verifySessionToken(token)
  if (!userId) return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })

  const user = await findUserById(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // 2. Buscar o pedido (transaction_id) do usuário
  // A transaction_id é o id do pedido na Cakto
  let orderId: string
  try {
    const { orderId: bodyOrderId } = await req.json()
    orderId = bodyOrderId
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!orderId) {
    return NextResponse.json({ error: 'ID do pedido não informado' }, { status: 400 })
  }

  // Verificar se o pedido pertence ao usuário
  const purchase = await findPurchaseByTransactionId(orderId)
  if (purchase && purchase.user_id !== userId) {
    return NextResponse.json({ error: 'Pedido não pertence a este usuário' }, { status: 403 })
  }

  // 3. Chamar API da Cakto para reembolso
  const result = await caktoRefundOrder(orderId)

  if (!result.success) {
    return NextResponse.json({
      error: result.message || 'Não foi possível solicitar o reembolso',
    }, { status: 422 })
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    note: 'O reembolso será processado pela Cakto. O acesso será bloqueado após a confirmação.',
  })
}

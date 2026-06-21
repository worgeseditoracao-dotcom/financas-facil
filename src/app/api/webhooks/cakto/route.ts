import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import {
  findUserByEmail, createUser, updateUser, updateUserById,
  findPurchaseByTransactionId, createPurchase, createWebhookLog
} from '@/lib/db'
import { isPaymentApproved, isChargebackOrRefund, verifyCaktoWebhook } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-cakto-signature') || req.headers.get('x-hub-signature-256') || ''
  const eventType = req.headers.get('x-cakto-event') || req.headers.get('x-event-type') || ''

  if (!verifyCaktoWebhook(rawBody, signature.replace('sha256=', ''))) {
    await createWebhookLog({
      provider: 'cakto',
      event_type: eventType || 'unknown',
      transaction_id: '',
      email: '',
      payload: rawBody,
      processed: false,
      error_message: 'Assinatura inválida',
    })
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const transactionId = payload.id || payload.transaction_id || payload.transaction?.id || ''
  const buyerEmail = payload.email || payload.customer?.email || payload.buyer?.email || payload.transaction?.customer?.email || ''
  const buyerName = payload.name || payload.customer?.name || payload.buyer?.name || payload.transaction?.customer?.name || ''
  const status = payload.status || payload.transaction?.status || payload.payment_status || ''
  const productName = payload.product?.name || payload.product_name || payload.transaction?.product?.name || 'Finanças Fácil'
  const productId = payload.product?.id || payload.product_id || payload.transaction?.product?.id || ''
  const amount = payload.amount || payload.transaction?.amount || payload.value || 0
  const paymentMethod = payload.payment_method || payload.transaction?.payment_method || ''

  if (!buyerEmail || !transactionId) {
    return NextResponse.json({ error: 'Dados inválidos - email e transaction_id obrigatórios' }, { status: 400 })
  }

  const emailLower = buyerEmail.toLowerCase().trim()

  const existingPurchase = await findPurchaseByTransactionId(String(transactionId))
  if (existingPurchase) {
    return NextResponse.json({ message: 'Transação já processada', duplicate: true })
  }

  try {
    if (isPaymentApproved(status)) {
      let user = await findUserByEmail(emailLower)
      if (!user) {
        user = await createUser({
          id: uuid(),
          name: buyerName || emailLower,
          email: emailLower,
          password_hash: '',
          auth_provider: 'email',
          role: 'user',
          access_status: 'active',
          access_type: 'lifetime',
        })
      } else {
        user = await updateUser(emailLower, {
          access_status: 'active',
          access_type: 'lifetime',
          blocked_reason: undefined,
          blocked_at: undefined,
          name: buyerName || user.name,
        })
      }

      await createPurchase({
        id: uuid(),
        user_id: user!.id,
        email: emailLower,
        transaction_id: String(transactionId),
        product_id: productId,
        product_name: productName,
        amount: Number(amount),
        payment_status: status,
        payment_method: paymentMethod,
        raw_payload: rawBody,
      })

      await createWebhookLog({
        provider: 'cakto',
        event_type: eventType || 'payment_approved',
        transaction_id: String(transactionId),
        email: emailLower,
        payload: rawBody,
        processed: true,
      })

      return NextResponse.json({
        message: 'Compra aprovada - acesso vitalício ativado',
        access_granted: true,
        user_id: user!.id,
      })
    }

    if (isChargebackOrRefund(status)) {
      const purchase = await findPurchaseByTransactionId(String(transactionId))
      const user = purchase
        ? await findUserById(purchase.user_id)
        : await findUserByEmail(emailLower)

      const blockReason = status.toLowerCase().includes('chargeback')
        ? 'chargeback'
        : status.toLowerCase().includes('refund')
          ? 'reembolso'
          : 'cancelamento'

      if (user) {
        await updateUserById(user.id, {
          access_status: 'blocked',
          blocked_reason: blockReason,
          blocked_at: new Date().toISOString(),
        })
      }

      if (!purchase) {
        await createPurchase({
          id: uuid(),
          user_id: user?.id || 'unknown',
          email: emailLower,
          transaction_id: String(transactionId),
          product_id: productId,
          product_name: productName,
          amount: Number(amount),
          payment_status: status,
          payment_method: paymentMethod,
          raw_payload: rawBody,
        })
      }

      await createWebhookLog({
        provider: 'cakto',
        event_type: eventType || blockReason,
        transaction_id: String(transactionId),
        email: emailLower,
        payload: rawBody,
        processed: true,
      })

      return NextResponse.json({
        message: `${blockReason} processado - acesso bloqueado`,
        access_blocked: true,
        reason: blockReason,
      })
    }

    await createPurchase({
      id: uuid(),
      user_id: '',
      email: emailLower,
      transaction_id: String(transactionId),
      product_id: productId,
      product_name: productName,
      amount: Number(amount),
      payment_status: status,
      payment_method: paymentMethod,
      raw_payload: rawBody,
    })

    await createWebhookLog({
      provider: 'cakto',
      event_type: eventType || 'unknown_status',
      transaction_id: String(transactionId),
      email: emailLower,
      payload: rawBody,
      processed: true,
      error_message: `Status não reconhecido: ${status}`,
    })

    return NextResponse.json({ message: 'Evento registrado - status pendente' })
  } catch (err: any) {
    await createWebhookLog({
      provider: 'cakto',
      event_type: eventType || 'error',
      transaction_id: String(transactionId),
      email: emailLower,
      payload: rawBody,
      processed: false,
      error_message: err?.message || 'Erro interno',
    })

    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import {
  findUserByEmail, findUserById, createUser, updateUser, updateUserById,
  findPurchaseByTransactionId, createPurchase, createWebhookLog
} from '@/lib/db'
import {
  verifyCaktoPayloadSecret, APPROVED_STATUSES, REVOKED_STATUSES, CAKTO_EVENTS
} from '@/lib/cakto'

// Estrutura do payload da Cakto (docs: https://docs.cakto.com.br)
interface CaktoWebhookPayload {
  event: string
  secret: string
  data: {
    id: string               // Order ID (UUID)
    refId: string            // ID curto de referência
    status: string           // paid, refunded, chargedback, canceled...
    amount: number
    paidAt: string | null
    refundedAt: string | null
    chargedbackAt: string | null
    canceledAt: string | null
    refund_reason: string | null
    reason: string | null
    paymentMethod: string
    installments: number
    product: {
      id: string
      name: string
      type: 'unique' | 'subscription'
    }
    offer: {
      id: string
      name: string
      price: number
    }
    customer: {
      name: string
      email: string
      phone?: string
      docType?: string
      docNumber?: string
    }
    subscription?: string | null
    checkoutUrl?: string
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  let payload: CaktoWebhookPayload

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload JSON inválido' }, { status: 400 })
  }

  // Verificação do secret (campo secret no body — padrão Cakto)
  if (!verifyCaktoPayloadSecret(payload.secret || '')) {
    await createWebhookLog({
      provider: 'cakto',
      event_type: payload.event || 'unknown',
      transaction_id: payload.data?.id || '',
      email: payload.data?.customer?.email || '',
      payload: rawBody,
      processed: false,
      error_message: 'Secret inválido',
    })
    return NextResponse.json({ error: 'Secret inválido' }, { status: 401 })
  }

  const { event, data } = payload

  if (!data?.id || !data?.customer?.email) {
    return NextResponse.json({ error: 'Dados obrigatórios ausentes (id, customer.email)' }, { status: 400 })
  }

  const orderId = data.id
  const email = data.customer.email.toLowerCase().trim()
  const name = data.customer.name || email
  const productName = data.product?.name || 'Finanças Fácil'
  const amount = Number(data.amount) || 0
  const status = data.status

  // Deduplicação
  const existing = await findPurchaseByTransactionId(orderId)

  try {
    // ─── COMPRA APROVADA ───────────────────────────────────────────────
    if (event === CAKTO_EVENTS.PURCHASE_APPROVED || APPROVED_STATUSES.has(status)) {
      if (existing) {
        return NextResponse.json({ message: 'Pedido já processado', duplicate: true })
      }

      let user = await findUserByEmail(email)
      if (!user) {
        user = await createUser({
          id: uuid(),
          name,
          email,
          password_hash: '',
          auth_provider: 'email',
          role: 'user',
          access_status: 'active',
          access_type: 'lifetime',
        })
      } else {
        user = await updateUser(email, {
          name: name || user.name,
          access_status: 'active',
          access_type: 'lifetime',
          blocked_reason: undefined,
          blocked_at: undefined,
        })
      }

      await createPurchase({
        id: uuid(),
        user_id: user!.id,
        email,
        transaction_id: orderId,
        product_id: data.product?.id || '',
        product_name: productName,
        amount,
        payment_status: 'paid',
        payment_method: data.paymentMethod || '',
        raw_payload: rawBody,
      })

      await createWebhookLog({
        provider: 'cakto',
        event_type: event,
        transaction_id: orderId,
        email,
        payload: rawBody,
        processed: true,
      })

      return NextResponse.json({
        ok: true,
        message: 'Compra aprovada — acesso vitalício ativado',
        user_id: user!.id,
        email,
      })
    }

    // ─── REEMBOLSO ─────────────────────────────────────────────────────
    if (event === CAKTO_EVENTS.REFUND || status === 'refunded' || status === 'refund_requested') {
      const purchase = existing || await findPurchaseByTransactionId(orderId)
      let user = purchase
        ? await findUserById(purchase.user_id)
        : await findUserByEmail(email)

      if (user) {
        await updateUserById(user.id, {
          access_status: 'blocked',
          blocked_reason: 'reembolso',
          blocked_at: new Date().toISOString(),
        })
      }

      if (!existing) {
        await createPurchase({
          id: uuid(),
          user_id: user?.id || '',
          email,
          transaction_id: orderId,
          product_id: data.product?.id || '',
          product_name: productName,
          amount,
          payment_status: 'refunded',
          payment_method: data.paymentMethod || '',
          raw_payload: rawBody,
        })
      }

      await createWebhookLog({
        provider: 'cakto',
        event_type: event,
        transaction_id: orderId,
        email,
        payload: rawBody,
        processed: true,
      })

      return NextResponse.json({
        ok: true,
        message: 'Reembolso processado — acesso bloqueado',
        email,
        reason: data.refund_reason || 'reembolso solicitado',
      })
    }

    // ─── CHARGEBACK ─────────────────────────────────────────────────────
    if (event === CAKTO_EVENTS.CHARGEBACK || status === 'chargedback') {
      const purchase = existing || await findPurchaseByTransactionId(orderId)
      let user = purchase
        ? await findUserById(purchase.user_id)
        : await findUserByEmail(email)

      if (user) {
        await updateUserById(user.id, {
          access_status: 'blocked',
          blocked_reason: 'chargeback',
          blocked_at: new Date().toISOString(),
        })
      }

      if (!existing) {
        await createPurchase({
          id: uuid(),
          user_id: user?.id || '',
          email,
          transaction_id: orderId,
          product_id: data.product?.id || '',
          product_name: productName,
          amount,
          payment_status: 'chargedback',
          payment_method: data.paymentMethod || '',
          raw_payload: rawBody,
        })
      }

      await createWebhookLog({
        provider: 'cakto',
        event_type: event,
        transaction_id: orderId,
        email,
        payload: rawBody,
        processed: true,
      })

      return NextResponse.json({ ok: true, message: 'Chargeback processado — acesso bloqueado', email })
    }

    // ─── CANCELAMENTO / ASSINATURA ──────────────────────────────────────
    if (
      event === CAKTO_EVENTS.SUBSCRIPTION_CANCELED ||
      REVOKED_STATUSES.has(status)
    ) {
      let user = await findUserByEmail(email)
      if (user) {
        await updateUserById(user.id, {
          access_status: 'blocked',
          blocked_reason: 'cancelamento',
          blocked_at: new Date().toISOString(),
        })
      }

      await createWebhookLog({
        provider: 'cakto',
        event_type: event,
        transaction_id: orderId,
        email,
        payload: rawBody,
        processed: true,
      })

      return NextResponse.json({ ok: true, message: 'Cancelamento processado — acesso bloqueado', email })
    }

    // ─── OUTROS EVENTOS (pix_gerado, boleto_gerado, etc.) ──────────────
    await createWebhookLog({
      provider: 'cakto',
      event_type: event,
      transaction_id: orderId,
      email,
      payload: rawBody,
      processed: true,
      error_message: `Evento informativo: ${event}`,
    })

    return NextResponse.json({ ok: true, message: `Evento ${event} registrado` })
  } catch (err: any) {
    console.error('Webhook Cakto error:', err)
    await createWebhookLog({
      provider: 'cakto',
      event_type: event || 'error',
      transaction_id: orderId || '',
      email: email || '',
      payload: rawBody,
      processed: false,
      error_message: err?.message || 'Erro interno',
    }).catch(() => {})

    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 })
  }
}



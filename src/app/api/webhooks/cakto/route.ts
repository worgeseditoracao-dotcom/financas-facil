import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import {
  findUserByEmail, findUserById, createUser, updateUser, updateUserById,
  findPurchaseByTransactionId, createPurchase, createWebhookLog
} from '@/lib/db'
import { verifyCaktoPayloadSecret, APPROVED_STATUSES, CAKTO_EVENTS } from '@/lib/cakto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const eventHeader = req.headers.get('x-cakto-event') || ''

  // Teste da Cakto (envia body vazio ou {"event": "ping"})
  if (!rawBody || rawBody === '{}') {
    await createWebhookLog({
      provider: 'cakto',
      event_type: eventHeader || 'test_ping',
      transaction_id: '',
      email: '',
      payload: rawBody || '{}',
      processed: true,
      error_message: 'Evento de teste — ignorado',
    }).catch(() => {})
    return NextResponse.json({ ok: true, message: 'Teste recebido' })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    await createWebhookLog({
      provider: 'cakto',
      event_type: 'parse_error',
      transaction_id: '',
      email: '',
      payload: rawBody,
      processed: false,
      error_message: 'JSON inválido',
    }).catch(() => {})
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  if (!payload.event && !payload.data) {
    await createWebhookLog({
      provider: 'cakto',
      event_type: eventHeader || 'unknown_format',
      transaction_id: '',
      email: '',
      payload: rawBody,
      processed: true,
      error_message: 'Payload sem campos esperados (event/data)',
    }).catch(() => {})
    return NextResponse.json({ ok: true, message: 'Recebido (formato não reconhecido)' })
  }

  // Verificar secret (se configurado)
  const payloadSecret = payload.secret || payload.data?.secret || ''
  if (!verifyCaktoPayloadSecret(payloadSecret)) {
    await createWebhookLog({
      provider: 'cakto',
      event_type: payload.event || eventHeader || 'unknown',
      transaction_id: payload.data?.id || payload.id || '',
      email: payload.data?.customer?.email || payload.customer?.email || '',
      payload: rawBody,
      processed: false,
      error_message: `Secret inválido (recebido: ${payloadSecret.substring(0, 10)}..., esperado: ${process.env.CAKTO_WEBHOOK_SECRET?.substring(0, 10)}...)`,
    }).catch(() => {})
    return NextResponse.json({ error: 'Secret inválido' }, { status: 401 })
  }

  const event = payload.event || eventHeader
  const data = payload.data || payload

  // Extrair campos com fallbacks
  const orderId = data.id || payload.transaction_id || payload.id || ''
  const email = (data.customer?.email || payload.customer?.email || payload.buyer?.email || '').toLowerCase().trim()
  const name = data.customer?.name || payload.customer?.name || payload.buyer?.name || email
  const productName = data.product?.name || payload.product_name || 'ECONOMIZZEI'
  const amount = Number(data.amount || payload.amount || 0)
  const status = data.status || payload.status || ''

  if (!email || !orderId) {
    await createWebhookLog({
      provider: 'cakto',
      event_type: event || 'missing_data',
      transaction_id: orderId,
      email,
      payload: rawBody,
      processed: false,
      error_message: 'Dados obrigatórios ausentes (email ou orderId)',
    }).catch(() => {})
    return NextResponse.json({ error: 'Email e ID do pedido obrigatórios' }, { status: 400 })
  }

  // Deduplicação
  const existing = await findPurchaseByTransactionId(orderId)

  try {
    // ─── COMPRA APROVADA ───────────────────────────────────────────────
    if (event === CAKTO_EVENTS.PURCHASE_APPROVED || APPROVED_STATUSES.has(status)) {
      if (existing) {
        return NextResponse.json({ ok: true, message: 'Pedido já processado', duplicate: true })
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
        event_type: event || 'purchase_approved',
        transaction_id: orderId,
        email,
        payload: rawBody,
        processed: true,
      })

      console.log(`✅ Compra aprovada: ${email} — acesso vitalício ativado`)
      return NextResponse.json({ ok: true, message: 'Compra aprovada — acesso ativado', email })
    }

    // ─── REEMBOLSO ─────────────────────────────────────────────────────
    if (event === CAKTO_EVENTS.REFUND || status === 'refunded' || status === 'refund_requested') {
      let user = existing ? await findUserById(existing.user_id) : await findUserByEmail(email)
      if (user) {
        await updateUserById(user.id, {
          access_status: 'blocked',
          blocked_reason: 'reembolso',
          blocked_at: new Date().toISOString(),
        })
      }
      if (!existing) {
        await createPurchase({ id: uuid(), user_id: user?.id || '', email, transaction_id: orderId, product_id: '', product_name: productName, amount, payment_status: 'refunded', payment_method: '', raw_payload: rawBody })
      }
      await createWebhookLog({ provider: 'cakto', event_type: event, transaction_id: orderId, email, payload: rawBody, processed: true })
      return NextResponse.json({ ok: true, message: 'Reembolso processado — acesso bloqueado' })
    }

    // ─── CHARGEBACK ─────────────────────────────────────────────────────
    if (event === CAKTO_EVENTS.CHARGEBACK || status === 'chargedback') {
      let user = existing ? await findUserById(existing.user_id) : await findUserByEmail(email)
      if (user) {
        await updateUserById(user.id, { access_status: 'blocked', blocked_reason: 'chargeback', blocked_at: new Date().toISOString() })
      }
      if (!existing) {
        await createPurchase({ id: uuid(), user_id: user?.id || '', email, transaction_id: orderId, product_id: '', product_name: productName, amount, payment_status: 'chargedback', payment_method: '', raw_payload: rawBody })
      }
      await createWebhookLog({ provider: 'cakto', event_type: event, transaction_id: orderId, email, payload: rawBody, processed: true })
      return NextResponse.json({ ok: true, message: 'Chargeback processado — acesso bloqueado' })
    }

    // ─── CANCELAMENTO ──────────────────────────────────────────────────
    if (event === CAKTO_EVENTS.SUBSCRIPTION_CANCELED || status === 'canceled') {
      let user = await findUserByEmail(email)
      if (user) {
        await updateUserById(user.id, { access_status: 'blocked', blocked_reason: 'cancelamento', blocked_at: new Date().toISOString() })
      }
      await createWebhookLog({ provider: 'cakto', event_type: event, transaction_id: orderId, email, payload: rawBody, processed: true })
      return NextResponse.json({ ok: true, message: 'Cancelamento processado' })
    }

    // ─── OUTROS EVENTOS ────────────────────────────────────────────────
    await createWebhookLog({ provider: 'cakto', event_type: event || 'other', transaction_id: orderId, email, payload: rawBody, processed: true, error_message: `Evento informativo: ${event}` })
    return NextResponse.json({ ok: true, message: `Evento ${event} registrado` })
  } catch (err: any) {
    console.error('Webhook error:', err)
    await createWebhookLog({ provider: 'cakto', event_type: event || 'error', transaction_id: orderId, email, payload: rawBody, processed: false, error_message: err?.message }).catch(() => {})
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

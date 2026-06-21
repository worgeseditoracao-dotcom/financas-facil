import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { findUserByEmail, createUser, updateUser, findPurchaseByProviderId, createPurchase } from '@/lib/db'
import { isPaymentApproved } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()
    const { id, email, name, status, product, transaction } = payload

    const buyerEmail = email || transaction?.customer?.email || payload.buyer?.email
    const buyerName = name || transaction?.customer?.name || payload.buyer?.name
    const purchaseId = id || transaction?.id || payload.id
    const paymentStatus = status || transaction?.status || payload.status
    const productName = product?.name || transaction?.product?.name || payload.product_name || 'Finanças Fácil'

    if (!buyerEmail || !purchaseId) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const existing = findPurchaseByProviderId(String(purchaseId))
    if (existing) {
      return NextResponse.json({ message: 'Webhook já processado', duplicate: true })
    }

    const approved = isPaymentApproved(paymentStatus)
    const emailLower = buyerEmail.toLowerCase()

    let user = findUserByEmail(emailLower)
    if (!user) {
      user = createUser({
        id: uuid(),
        name: buyerName || buyerEmail,
        email: emailLower,
        password_hash: '',
        access_status: approved ? 'active' : 'inactive',
      })
    } else if (approved) {
      user = updateUser(emailLower, { access_status: 'active', name: buyerName || user.name })
    }

    createPurchase({
      id: uuid(),
      user_id: user!.id,
      provider: 'cakto',
      provider_purchase_id: String(purchaseId),
      product_name: productName,
      buyer_email: emailLower,
      buyer_name: buyerName || buyerEmail,
      payment_status: paymentStatus,
      raw_payload: JSON.stringify(payload),
    })

    return NextResponse.json({ message: 'Webhook processado', access_granted: approved })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

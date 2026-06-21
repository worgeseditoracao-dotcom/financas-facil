// Cakto API Client - OAuth2 com cache de token
// Docs: https://docs.cakto.com.br

const CAKTO_BASE_URL = 'https://api.cakto.com.br'

interface CaktoToken {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
  expires_at: number
}

// Cache em memória (válido durante warm serverless)
let cachedToken: CaktoToken | null = null

async function getCaktoToken(): Promise<string> {
  const clientId = process.env.CAKTO_CLIENT_ID
  const clientSecret = process.env.CAKTO_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('CAKTO_CLIENT_ID e CAKTO_CLIENT_SECRET não configurados')
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expires_at > now + 60_000) {
    return cachedToken.access_token
  }

  const res = await fetch(`${CAKTO_BASE_URL}/public_api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Falha ao obter token Cakto: ${res.status} ${err}`)
  }

  const data: CaktoToken = await res.json()
  cachedToken = { ...data, expires_at: now + data.expires_in * 1000 }
  return cachedToken.access_token
}

export async function caktoRefundOrder(orderId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getCaktoToken()
    const res = await fetch(`${CAKTO_BASE_URL}/public_api/orders/${orderId}/refund/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()

    if (res.ok) {
      return { success: true, message: data.detail || 'Reembolso solicitado com sucesso' }
    }
    return { success: false, message: data.detail || `Erro ${res.status} ao solicitar reembolso` }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Erro ao conectar com a Cakto' }
  }
}

export async function caktoGetOrder(orderId: string) {
  const token = await getCaktoToken()
  const res = await fetch(`${CAKTO_BASE_URL}/public_api/orders/${orderId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Erro ao buscar pedido ${orderId}: ${res.status}`)
  return res.json()
}

// Verifica se o secret do webhook é válido
// A Cakto envia o campo "secret" no payload — deve bater com CAKTO_WEBHOOK_SECRET
export function verifyCaktoPayloadSecret(secret: string): boolean {
  const expectedSecret = process.env.CAKTO_WEBHOOK_SECRET
  if (!expectedSecret) {
    console.warn('CAKTO_WEBHOOK_SECRET não configurado — aceitando sem verificação')
    return true
  }
  return secret === expectedSecret
}

// Status que indicam pagamento aprovado
export const APPROVED_STATUSES = new Set(['paid', 'approved', 'authorized'])

// Status que indicam reembolso/chargeback/cancelamento
export const REVOKED_STATUSES = new Set([
  'refunded', 'refund_requested', 'chargedback', 'canceled',
  'chargeback', 'blocked', 'in_protest', 'prechargeback', 'MED',
])

// Eventos da Cakto
export const CAKTO_EVENTS = {
  PURCHASE_APPROVED: 'purchase_approved',
  PURCHASE_REFUSED: 'purchase_refused',
  REFUND: 'refund',
  CHARGEBACK: 'chargeback',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',
  PIX_GERADO: 'pix_gerado',
  BOLETO_GERADO: 'boleto_gerado',
} as const

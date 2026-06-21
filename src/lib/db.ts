import { supabase } from './supabase'
import { v4 as uuid } from 'uuid'

export interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
  auth_provider?: 'email' | 'google'
  role: 'user' | 'admin'
  access_status: 'active' | 'inactive' | 'blocked'
  access_type: 'lifetime' | 'subscription' | 'trial' | null
  blocked_reason?: string
  blocked_at?: string
  created_at: string
  updated_at: string
}

export interface PurchaseRow {
  id: string
  user_id: string
  email: string
  transaction_id: string
  product_id?: string
  product_name: string
  amount: number
  payment_status: string
  payment_method?: string
  raw_payload: string
  created_at: string
  updated_at: string
}

export interface WebhookLogRow {
  id: string
  provider: string
  event_type: string
  transaction_id: string
  email: string
  payload: string
  processed: boolean
  error_message?: string
  created_at: string
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle()
  return data || undefined
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data || undefined
}

export async function createUser(user: Omit<UserRow, 'created_at' | 'updated_at'>): Promise<UserRow> {
  const now = new Date().toISOString()
  const newUser: UserRow = { ...user, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('users').insert(newUser).select().single()
  if (error) throw new Error(`Erro ao criar usuário: ${error.message}`)
  return data
}

export async function updateUser(email: string, updates: Partial<UserRow>): Promise<UserRow | undefined> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('email', email.toLowerCase())
    .select()
    .maybeSingle()
  if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`)
  return data || undefined
}

export async function updateUserById(id: string, updates: Partial<UserRow>): Promise<UserRow | undefined> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw new Error(`Erro ao atualizar usuário: ${error.message}`)
  return data || undefined
}

export async function findPurchaseByTransactionId(transactionId: string): Promise<PurchaseRow | undefined> {
  const { data } = await supabase
    .from('purchases')
    .select('*')
    .eq('transaction_id', transactionId)
    .maybeSingle()
  return data || undefined
}

export async function createPurchase(purchase: Omit<PurchaseRow, 'created_at' | 'updated_at'>): Promise<PurchaseRow> {
  const now = new Date().toISOString()
  const newPurchase: PurchaseRow = { ...purchase, created_at: now, updated_at: now }
  const { data, error } = await supabase.from('purchases').insert(newPurchase).select().single()
  if (error) throw new Error(`Erro ao criar compra: ${error.message}`)
  return data
}

export async function getAllUsers(): Promise<UserRow[]> {
  const { data } = await supabase.from('users').select('*')
  return data || []
}

export async function createWebhookLog(log: Omit<WebhookLogRow, 'id' | 'created_at'>): Promise<WebhookLogRow> {
  const now = new Date().toISOString()
  const entry: WebhookLogRow = { ...log, id: uuid(), created_at: now }
  const { data, error } = await supabase.from('webhook_logs').insert(entry).select().single()
  if (error) throw new Error(`Erro ao criar log: ${error.message}`)
  return data
}

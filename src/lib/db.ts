import { kv } from '@vercel/kv'
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

export interface AccessControlRow {
  id: string
  user_id: string
  access_type: 'lifetime' | 'subscription' | 'trial'
  status: 'active' | 'inactive' | 'blocked'
  activated_at?: string
  blocked_at?: string
  blocked_reason?: string
  created_at: string
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

async function getUsers(): Promise<UserRow[]> {
  const users = await kv.get<UserRow[]>('users')
  return users || []
}

async function setUsers(users: UserRow[]): Promise<void> {
  await kv.set('users', users)
}

async function getPurchases(): Promise<PurchaseRow[]> {
  const purchases = await kv.get<PurchaseRow[]>('purchases')
  return purchases || []
}

async function setPurchases(purchases: PurchaseRow[]): Promise<void> {
  await kv.set('purchases', purchases)
}

async function getWebhookLogs(): Promise<WebhookLogRow[]> {
  const logs = await kv.get<WebhookLogRow[]>('webhook_logs')
  return logs || []
}

async function setWebhookLogs(logs: WebhookLogRow[]): Promise<void> {
  await kv.set('webhook_logs', logs)
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const users = await getUsers()
  return users.find(u => u.email === email.toLowerCase())
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  const users = await getUsers()
  return users.find(u => u.id === id)
}

export async function createUser(data: Omit<UserRow, 'created_at' | 'updated_at'>): Promise<UserRow> {
  const users = await getUsers()
  const now = new Date().toISOString()
  const user: UserRow = { ...data, created_at: now, updated_at: now }
  users.push(user)
  await setUsers(users)
  return user
}

export async function updateUser(email: string, updates: Partial<UserRow>): Promise<UserRow | undefined> {
  const users = await getUsers()
  const idx = users.findIndex(u => u.email === email.toLowerCase())
  if (idx === -1) return undefined
  users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() }
  await setUsers(users)
  return users[idx]
}

export async function updateUserById(id: string, updates: Partial<UserRow>): Promise<UserRow | undefined> {
  const users = await getUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) return undefined
  users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() }
  await setUsers(users)
  return users[idx]
}

export async function findPurchaseByTransactionId(transactionId: string): Promise<PurchaseRow | undefined> {
  const purchases = await getPurchases()
  return purchases.find(p => p.transaction_id === transactionId)
}

export async function createPurchase(data: Omit<PurchaseRow, 'created_at' | 'updated_at'>): Promise<PurchaseRow> {
  const purchases = await getPurchases()
  const now = new Date().toISOString()
  const purchase: PurchaseRow = { ...data, created_at: now, updated_at: now }
  purchases.push(purchase)
  await setPurchases(purchases)
  return purchase
}

export async function getAllUsers(): Promise<UserRow[]> {
  return getUsers()
}

export async function createWebhookLog(data: Omit<WebhookLogRow, 'id' | 'created_at'>): Promise<WebhookLogRow> {
  const logs = await getWebhookLogs()
  const now = new Date().toISOString()
  const log: WebhookLogRow = { ...data, id: uuid(), created_at: now }
  logs.push(log)
  if (logs.length > 1000) logs.splice(0, logs.length - 1000)
  await setWebhookLogs(logs)
  return log
}

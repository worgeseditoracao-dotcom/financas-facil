import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = 'users.json'
const PURCHASES_FILE = 'purchases.json'

export interface UserRow {
  id: string
  name: string
  email: string
  password_hash: string
  access_status: 'active' | 'inactive' | 'blocked'
  created_at: string
  updated_at: string
}

export interface PurchaseRow {
  id: string
  user_id: string
  provider: string
  provider_purchase_id: string
  product_name: string
  buyer_email: string
  buyer_name: string
  payment_status: string
  raw_payload: string
  created_at: string
  updated_at: string
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readJSON<T>(filename: string): T[] {
  ensureDir()
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return []
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return []
  }
}

function writeJSON<T>(filename: string, data: T[]) {
  ensureDir()
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8')
}

export function findUserByEmail(email: string): UserRow | undefined {
  return readJSON<UserRow>(USERS_FILE).find(u => u.email === email.toLowerCase())
}

export function findUserById(id: string): UserRow | undefined {
  return readJSON<UserRow>(USERS_FILE).find(u => u.id === id)
}

export function createUser(data: Omit<UserRow, 'created_at' | 'updated_at'>): UserRow {
  const users = readJSON<UserRow>(USERS_FILE)
  const now = new Date().toISOString()
  const user: UserRow = { ...data, created_at: now, updated_at: now }
  users.push(user)
  writeJSON(USERS_FILE, users)
  return user
}

export function updateUser(email: string, updates: Partial<UserRow>): UserRow | undefined {
  const users = readJSON<UserRow>(USERS_FILE)
  const idx = users.findIndex(u => u.email === email.toLowerCase())
  if (idx === -1) return undefined
  users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() }
  writeJSON(USERS_FILE, users)
  return users[idx]
}

export function findPurchaseByProviderId(providerPurchaseId: string): PurchaseRow | undefined {
  return readJSON<PurchaseRow>(PURCHASES_FILE).find(p => p.provider_purchase_id === providerPurchaseId)
}

export function createPurchase(data: Omit<PurchaseRow, 'created_at' | 'updated_at'>): PurchaseRow {
  const purchases = readJSON<PurchaseRow>(PURCHASES_FILE)
  const now = new Date().toISOString()
  const purchase: PurchaseRow = { ...data, created_at: now, updated_at: now }
  purchases.push(purchase)
  writeJSON(PURCHASES_FILE, purchases)
  return purchase
}

export function getAllUsers(): UserRow[] {
  return readJSON<UserRow>(USERS_FILE)
}

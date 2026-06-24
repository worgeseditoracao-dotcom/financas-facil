export interface Transaction {
  id: string
  date: string
  category: string
  description: string
  value: number
  type: 'income' | 'expense'
  module: 'personal' | 'business'
  createdAt: string
  recurring?: boolean
  dueDate?: string
  status?: 'paid' | 'pending' | 'overdue'
  tags?: string[]
  subcategory?: string
  accountId?: string
  cardId?: string
  clientId?: string
  installment?: { total: number; current: number }
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  module: 'personal' | 'business'
  subcategories?: string[]
}

export interface Goal {
  id: string
  name: string
  description?: string
  targetValue: number
  currentValue: number
  deadline?: string
  category: string
  module: 'personal' | 'business'
  goalType: 'generic' | 'travel' | 'purchase' | 'investment' | 'emergency' | 'education'
  monthlySaving?: number
  monthlySavingSuggest?: number
  createdAt: string
}

export interface Investment {
  id: string
  name: string
  type: 'selic' | 'cdb' | 'tesouro_direto' | 'poupanca' | 'ipca' | 'pfixa' | 'acoes' | 'fii' | 'crypto'
  initialValue: number
  monthlyContribution: number
  annualRate: number
  startDate: string
  deadline?: string
  module: 'personal' | 'business'
  createdAt: string
}

export interface BankAccount {
  id: string
  name: string
  bank: string
  type: 'checking' | 'savings' | 'salary' | 'investment' | 'business'
  balance: number
  module: 'personal' | 'business'
  color?: string
  createdAt: string
}

export interface CreditCard {
  id: string
  name: string
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other'
  limit: number
  closingDay: number
  dueDay: number
  module: 'personal' | 'business'
  color?: string
  purchases: CardPurchase[]
  createdAt: string
}

export interface CardPurchase {
  id: string
  description: string
  value: number
  date: string
  installments: number
  category: string
  paid: boolean
}

export interface Subscription {
  id: string
  name: string
  value: number
  category: string
  dueDay: number
  active: boolean
  createdAt: string
}

export interface BusinessProduct {
  id: string
  name: string
  description?: string
  price: number
  cost: number
  category: 'product' | 'service' | 'digital'
  createdAt: string
}

export interface Client {
  id: string
  name: string
  phone?: string
  email?: string
  service?: string
  value?: number
  status: 'active' | 'inactive'
  createdAt: string
  totalSales?: number
  lastSale?: string
  notes?: string
}

export interface BusinessInfo {
  id: string
  monthlyAds: number
  monthlyServers: number
  monthlyEmployees: number
  otherCosts: number
  notes?: string
}

export interface Bill {
  id: string
  name: string
  description?: string
  value: number
  dueDate: string
  category: string
  paid: boolean
  paidDate?: string
  recurring: boolean
  frequency?: 'weekly' | 'monthly' | 'yearly'
  endDate?: string
  isGenerated?: boolean
  accountId?: string
  module: 'personal' | 'business'
  type: 'bill' | 'financing' | 'installment' | 'card' | 'advance'
  installment?: { total: number; current: number }
  financing?: { total: number; paid: number; rate: number }
  cardId?: string
  supplierId?: string
  createdAt: string
}

export interface Receivable {
  id: string
  name: string
  description?: string
  value: number
  dueDate: string
  clientId?: string
  category: string
  received: boolean
  receivedDate?: string
  recurring: boolean
  frequency?: 'weekly' | 'monthly' | 'yearly'
  endDate?: string
  isGenerated?: boolean
  accountId?: string
  module: 'personal' | 'business'
  type: 'receivable' | 'installment' | 'invoice'
  installment?: { total: number; current: number }
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  category: string
  document?: string
  notes?: string
  createdAt: string
}

export interface Budget {
  id: string
  month: string
  year: number
  expectedIncome: number
  expectedExpenses: number
  module: 'personal' | 'business'
  createdAt: string
}

export interface Insight {
  type: 'warning' | 'success' | 'info'
  message: string
  icon?: string
}

export interface StatementEntry {
  id: string
  date: string
  description: string
  value: number
  type: 'income' | 'expense'
  bank: string
  matchedTransactionId?: string
  manuallyMatched: boolean
  ignored: boolean
  importedAt: string
}

export interface AppSettings {
  accentColor: string
  currency: 'BRL' | 'USD' | 'EUR'
  name: string
}

export type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'custom'

export interface ReportFilters {
  period: FilterPeriod
  startDate?: string
  endDate?: string
  module?: 'personal' | 'business' | 'all'
}

import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, startOfYear, endOfYear, isWithinInterval } from 'date-fns'
import type { Transaction, FilterPeriod } from './types'

export function formatCurrency(value: number, currency: string = 'BRL'): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value)
  } catch {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd/MM/yyyy')
}

export function formatDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getDateRange(period: FilterPeriod, customStart?: string, customEnd?: string) {
  const now = new Date()
  switch (period) {
    case 'today':
      return { start: formatDateISO(startOfDay(now)), end: formatDateISO(endOfDay(now)) }
    case 'week':
      return { start: formatDateISO(startOfWeek(now, { weekStartsOn: 0 })), end: formatDateISO(endOfWeek(now, { weekStartsOn: 0 })) }
    case 'month':
      return { start: formatDateISO(startOfMonth(now)), end: formatDateISO(endOfMonth(now)) }
    case 'year':
      return { start: formatDateISO(startOfYear(now)), end: formatDateISO(endOfYear(now)) }
    case 'custom':
      return { start: customStart || formatDateISO(startOfMonth(now)), end: customEnd || formatDateISO(endOfMonth(now)) }
  }
}

export function filterTransactionsByPeriod(transactions: Transaction[], period: FilterPeriod, startDate?: string, endDate?: string): Transaction[] {
  const range = getDateRange(period, startDate, endDate)
  return transactions.filter(t => {
    const date = t.date
    return date >= range.start && date <= range.end
  })
}

export function filterTransactionsByModule(transactions: Transaction[], module?: 'personal' | 'business' | 'all'): Transaction[] {
  if (!module || module === 'all') return transactions
  return transactions.filter(t => t.module === module)
}

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => acc + t.value, 0)
}

export function calculateIncome(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0)
}

export function calculateExpenses(transactions: Transaction[]): number {
  return Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0))
}

export function groupByCategory(transactions: Transaction[]) {
  const groups: Record<string, { category: string; value: number }> = {}
  for (const t of transactions) {
    if (!groups[t.category]) groups[t.category] = { category: t.category, value: 0 }
    groups[t.category].value += Math.abs(t.value)
  }
  return Object.values(groups).sort((a, b) => b.value - a.value)
}

export function groupByMonth(transactions: Transaction[]) {
  const groups: Record<string, { month: string; income: number; expense: number }> = {}
  for (const t of transactions) {
    const key = format(parseISO(t.date), 'yyyy-MM')
    if (!groups[key]) groups[key] = { month: key, income: 0, expense: 0 }
    if (t.type === 'income') groups[key].income += t.value
    else groups[key].expense += Math.abs(t.value)
  }
  return Object.values(groups).sort((a, b) => a.month.localeCompare(b.month))
}

export function simulateInvestment(initialValue: number, monthlyContribution: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12
  const data: { month: number; value: number; contributed: number }[] = []
  let value = initialValue
  for (let m = 1; m <= months; m++) {
    value = value * (1 + monthlyRate) + monthlyContribution
    if (m % 1 === 0 || m === months) {
      data.push({ month: m, value: Math.round(value * 100) / 100, contributed: initialValue + monthlyContribution * m })
    }
  }
  return data
}

export function calculateMonthlyGoal(target: number, current: number, months: number) {
  if (months <= 0) return 0
  return (target - current) / months
}

export function calculateClientHealth(client: { totalSales?: number; value?: number; lastSale?: string }) {
  if (!client.totalSales && !client.value) return { score: 0, level: 'no-data' }
  const score = Math.min(100, ((client.totalSales || 0) + (client.value || 0)) / 100)
  if (score >= 70) return { score: Math.round(score), level: 'excellent' }
  if (score >= 40) return { score: Math.round(score), level: 'good' }
  return { score: Math.round(score), level: 'attention' }
}

import { addMonths, addWeeks, addYears, format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns'

export type FrequencyType = 'weekly' | 'monthly' | 'yearly'

export interface RecurringConfig {
  frequency: FrequencyType
  nextDate?: string
  endDate?: string
  autoGenerate: boolean
}

export function getNextDate(currentDate: string, frequency: FrequencyType): string {
  const date = parseISO(currentDate)
  switch (frequency) {
    case 'weekly': return format(addWeeks(date, 1), 'yyyy-MM-dd')
    case 'monthly': return format(addMonths(date, 1), 'yyyy-MM-dd')
    case 'yearly': return format(addYears(date, 1), 'yyyy-MM-dd')
  }
}

export function shouldGenerateNext(currentDate: string, frequency: FrequencyType): boolean {
  const nextDate = parseISO(getNextDate(currentDate, frequency))
  return isBefore(nextDate, startOfDay(new Date())) || format(nextDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
}

export function generateUpcomingDates(startDate: string, frequency: FrequencyType, count: number = 6): string[] {
  const dates: string[] = []
  let current = startDate
  for (let i = 0; i < count; i++) {
    current = getNextDate(current, frequency)
    dates.push(current)
  }
  return dates
}

export function getFrequencyLabel(frequency: FrequencyType): string {
  switch (frequency) {
    case 'weekly': return 'Semanal'
    case 'monthly': return 'Mensal'
    case 'yearly': return 'Anual'
  }
}

export function generateRecurringBills(bills: any[], receivables: any[]): { bills: any[]; receivables: any[] } {
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const threeMonthsFromNow = format(addMonths(now, 3), 'yyyy-MM-dd')

  const newBills: any[] = []
  const newReceivables: any[] = []

  for (const bill of bills) {
    if (!bill.recurring || !bill.frequency || bill.paid) continue

    const upcoming = generateUpcomingDates(bill.dueDate, bill.frequency, 6)
    for (const date of upcoming) {
      if (date > threeMonthsFromNow) break
      if (date <= bill.dueDate) continue

      const exists = bills.some((b: any) =>
        b.name === bill.name &&
        b.value === bill.value &&
        b.dueDate === date &&
        b.id !== bill.id
      )
      if (!exists && date >= today) {
        newBills.push({
          ...bill,
          dueDate: date,
          paid: false,
          paidDate: undefined,
          recurring: true,
          isGenerated: true,
        })
      }
    }
  }

  for (const rec of receivables) {
    if (!rec.recurring || !rec.frequency || rec.received) continue

    const upcoming = generateUpcomingDates(rec.dueDate, rec.frequency, 6)
    for (const date of upcoming) {
      if (date > threeMonthsFromNow) break
      if (date <= rec.dueDate) continue

      const exists = receivables.some((r: any) =>
        r.name === rec.name &&
        r.value === rec.value &&
        r.dueDate === date &&
        r.id !== rec.id
      )
      if (!exists && date >= today) {
        newReceivables.push({
          ...rec,
          dueDate: date,
          received: false,
          receivedDate: undefined,
          recurring: true,
          isGenerated: true,
        })
      }
    }
  }

  return { bills: newBills, receivables: newReceivables }
}

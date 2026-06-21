'use client'

import type { FilterPeriod } from '@/lib/types'
import Button from '../ui/Button'

interface Props {
  period: FilterPeriod
  onPeriodChange: (period: FilterPeriod) => void
}

const periods: { value: FilterPeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'year', label: 'Ano' },
  { value: 'custom', label: 'Personalizado' },
]

export default function ReportFilters({ period, onPeriodChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {periods.map(p => (
        <Button
          key={p.value}
          variant={period === p.value ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onPeriodChange(p.value)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}

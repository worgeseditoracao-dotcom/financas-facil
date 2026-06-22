import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: activeUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('access_status', 'active')
    const { count: blockedUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('access_status', 'blocked')
    const { count: totalPurchases } = await supabase.from('purchases').select('*', { count: 'exact', head: true })
    
    const { data: purchases } = await supabase.from('purchases').select('amount, payment_status, created_at')

    const totalRevenue = purchases?.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 0

    // Agrupar por mês
    const byMonth: Record<string, { month: string; revenue: number; count: number }> = {}
    for (const p of purchases || []) {
      const m = p.created_at?.substring(0, 7) || 'unknown'
      if (!byMonth[m]) byMonth[m] = { month: m, revenue: 0, count: 0 }
      byMonth[m].revenue += Number(p.amount) || 0
      byMonth[m].count++
    }

    // Agrupar por dia (últimos 30)
    const byDay: Record<string, { date: string; revenue: number; count: number }> = {}
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().substring(0, 10)
    for (const p of purchases || []) {
      const d = p.created_at?.substring(0, 10) || ''
      if (d >= thirtyDaysAgo) {
        if (!byDay[d]) byDay[d] = { date: d, revenue: 0, count: 0 }
        byDay[d].revenue += Number(p.amount) || 0
        byDay[d].count++
      }
    }

    // Agrupar por ano
    const byYear: Record<string, { year: string; revenue: number; count: number }> = {}
    for (const p of purchases || []) {
      const y = p.created_at?.substring(0, 4) || 'unknown'
      if (!byYear[y]) byYear[y] = { year: y, revenue: 0, count: 0 }
      byYear[y].revenue += Number(p.amount) || 0
      byYear[y].count++
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      blockedUsers: blockedUsers || 0,
      totalPurchases: totalPurchases || 0,
      totalRevenue,
      byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
      byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      byYear: Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year)),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

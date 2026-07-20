import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const results: string[] = []
  const tables = ['users', 'purchases', 'webhook_logs', 'companies', 'business_products', 'product_sales', 'user_data', 'messages']

  for (const t of tables) {
    const col = t === 'user_data' ? 'user_id' : 'id'
    const { error } = await supabase.from(t).select(col).limit(1)
    results.push(error ? `❌ ${t}` : `✅ ${t}`)
  }

  return NextResponse.json({ ok: true, results })
}

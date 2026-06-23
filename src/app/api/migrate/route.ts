import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const tables = ['companies', 'business_products', 'product_sales']
  const results: string[] = []

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      results.push(`❌ ${table}: ${error.message.substring(0, 100)}`)
    } else {
      results.push(`✅ ${table}`)
    }
  }

  if (results.some(r => r.includes('❌'))) {
    results.push('\n📋 Execute o SQL no Supabase SQL Editor:')
    results.push('   SQL em: supabase/migrations/00003_companies.sql')
  }

  return NextResponse.json({ ok: true, results })
}

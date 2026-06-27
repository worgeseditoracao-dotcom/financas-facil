import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const results: string[] = []

  // Verifica tabelas existentes
  for (const table of ['users', 'purchases', 'webhook_logs', 'companies', 'business_products', 'product_sales', 'user_data']) {
    const { error } = await supabase.from(table).select('id').limit(1)
    results.push(error ? `❌ ${table}` : `✅ ${table}`)
  }

  // Tenta criar user_data via inserção + tratamento de erro
  const { error } = await supabase.from('user_data').upsert({
    user_id: 'migrate_test',
    key: 'test',
    data: '{}',
    updated_at: new Date().toISOString(),
  }).select()

  if (error && error.message.includes('not find')) {
    results.push('\n📋 Execute o SQL no Supabase: supabase/migrations/00004_sync.sql')
  } else if (!error) {
    // Limpa o registro de teste
    await supabase.from('user_data').delete().eq('user_id', 'migrate_test')
    results.push('✅ user_data pronto para uso')
  }

  return NextResponse.json({ ok: true, results })
}

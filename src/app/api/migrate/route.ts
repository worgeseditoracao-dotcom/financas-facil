import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET() {
  const results: string[] = []

  try {
    // Criar via REST API direto
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // 1. Criar companies
    const c1 = await supabase.from('companies').select('id').limit(1)
    if (c1.error && c1.error.message.includes('not find')) {
      results.push('❌ companies - precisa criar via SQL Editor')
    } else {
      results.push('✅ companies')
    }

    const c2 = await supabase.from('business_products').select('id').limit(1)
    if (c2.error && c2.error.message.includes('not find')) {
      results.push('❌ business_products - precisa criar via SQL Editor')
    } else {
      results.push('✅ business_products')
    }

    const c3 = await supabase.from('product_sales').select('id').limit(1)
    if (c3.error && c3.error.message.includes('not find')) {
      results.push('❌ product_sales - precisa criar via SQL Editor')
    } else {
      results.push('✅ product_sales')
    }

    if (results.some(r => r.includes('❌'))) {
      results.push('\n📋 SQL para executar:')
      results.push(`
CREATE TABLE companies (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT DEFAULT 'business', monthly_revenue_target NUMERIC(12,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX idx_companies_user ON companies(user_id);

CREATE TABLE business_products (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, sale_price NUMERIC(12,2) DEFAULT 0, cost_price NUMERIC(12,2) DEFAULT 0, category TEXT DEFAULT 'product', active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX idx_products_company ON business_products(company_id);

CREATE TABLE product_sales (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, product_id TEXT NOT NULL, user_id TEXT NOT NULL, quantity INTEGER DEFAULT 1, sale_price NUMERIC(12,2) NOT NULL, cost_price NUMERIC(12,2) NOT NULL, sale_date TEXT NOT NULL, client_name TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW());
      `.trim())
      results.push('\n🔗 Execute em: https://supabase.com/dashboard/project/pkampjlywarrfmodmvaj/sql/new')
    }
  } catch (e: any) {
    results.push('Erro: ' + e.message)
  }

  return NextResponse.json({ ok: true, results })
}

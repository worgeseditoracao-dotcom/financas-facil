import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const pool = new Pool({
      host: 'aws-1-us-west-2.pooler.supabase.com',
      port: 5432,
      user: `postgres.pkampjlywarrfmodmvaj`,
      password: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    })

    const sql = `
CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT DEFAULT 'business', monthly_revenue_target NUMERIC(12,2) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_companies_user ON companies(user_id);
CREATE TABLE IF NOT EXISTS business_products (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, sale_price NUMERIC(12,2) DEFAULT 0, cost_price NUMERIC(12,2) DEFAULT 0, category TEXT DEFAULT 'product', active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_products_company ON business_products(company_id);
CREATE TABLE IF NOT EXISTS product_sales (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, product_id TEXT NOT NULL, user_id TEXT NOT NULL, quantity INTEGER DEFAULT 1, sale_price NUMERIC(12,2) NOT NULL, cost_price NUMERIC(12,2) NOT NULL, sale_date TEXT NOT NULL, client_name TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_sales_company ON product_sales(company_id);
    `

    const client = await pool.connect()
    await client.query(sql)
    client.release()
    await pool.end()

    return NextResponse.json({ ok: true, message: 'Tabelas criadas com sucesso!' })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}

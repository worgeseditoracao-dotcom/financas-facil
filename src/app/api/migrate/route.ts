import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  auth_provider TEXT DEFAULT 'email',
  role TEXT DEFAULT 'user',
  access_status TEXT DEFAULT 'active',
  access_type TEXT,
  blocked_reason TEXT,
  blocked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  product_id TEXT DEFAULT '',
  product_name TEXT NOT NULL DEFAULT 'Finanças Fácil',
  amount NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT '',
  raw_payload TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
  updated_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'cakto',
  event_type TEXT NOT NULL DEFAULT '',
  transaction_id TEXT DEFAULT '',
  email TEXT DEFAULT '',
  payload TEXT DEFAULT '',
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
`

export async function GET() {
  try {
    // Divide em comandos separados por ;
    const statements = SQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    const results: string[] = []

    for (const stmt of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt })
      if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
        results.push(`ERRO: ${error.message}`)
      }
    }

    // Se não deu pra usar RPC, tenta direto via REST
    if (results.length > 0 && results.every(r => r.startsWith('ERRO'))) {
      const { error } = await supabase.from('users').select('id').limit(1)
      if (error) {
        return NextResponse.json({
          ok: false,
          message: 'As tabelas não existem. Execute o SQL manualmente no Supabase SQL Editor.',
          sql: SQL,
          supabase_dashboard: `${process.env.SUPABASE_URL?.replace('.supabase.co', '')}/sql`,
        })
      }
      return NextResponse.json({ ok: true, message: 'Tabelas já existem (verificadas via REST)' })
    }

    return NextResponse.json({ ok: true, message: 'Migração executada', results })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Erro interno' }, { status: 500 })
  }
}

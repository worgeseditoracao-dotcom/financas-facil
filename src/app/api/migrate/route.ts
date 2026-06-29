import { NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET() {
  try {
    const poolerUrl = 'postgresql://postgres.pkampjlywarrfmodmvaj@aws-1-us-west-2.pooler.supabase.com:5432/postgres'
    const pool = new Pool({
      connectionString: poolerUrl,
      password: process.env.SUPABASE_SERVICE_ROLE_KEY,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    const client = await pool.connect()
    const result = await client.query(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        data TEXT DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, key)
      );
    `)
    client.release()
    await pool.end()

    return NextResponse.json({ ok: true, message: 'Tabela user_data criada!' })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}

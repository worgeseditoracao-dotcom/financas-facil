import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1)
    if (error) throw new Error(error.message)
    return NextResponse.json({ ok: true, message: 'Database pinged', timestamp: new Date().toISOString() })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message }, { status: 500 })
  }
}

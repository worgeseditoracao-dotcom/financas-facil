import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { action, userId, store } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    if (action === 'save' && store) {
      await supabase.from('user_data').upsert({
        user_id: userId, key: 'store',
        data: JSON.stringify(store),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,key' })
      return NextResponse.json({ ok: true })
    }

    if (action === 'load') {
      const { data } = await supabase.from('user_data')
        .select('data').eq('user_id', userId).eq('key', 'store').maybeSingle()
      const store = data?.data ? JSON.parse(data.data) : null
      return NextResponse.json({ store })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

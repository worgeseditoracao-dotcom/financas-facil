import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { action, userId, store } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

    // Import dinâmico - só carrega supabase no runtime do servidor
    const { syncToCloud, loadFromCloud } = await import('@/lib/cloudSync')

    if (action === 'save' && store) {
      await syncToCloud(userId, 'store', store)
      return NextResponse.json({ ok: true })
    }

    if (action === 'load') {
      const data = await loadFromCloud(userId, 'store')
      return NextResponse.json({ store: data })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

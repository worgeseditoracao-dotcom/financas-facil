import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('to_admin', true).eq('read', false)
    return NextResponse.json({ unread: count || 0 })
  } catch (err: any) {
    return NextResponse.json({ unread: 0 })
  }
}

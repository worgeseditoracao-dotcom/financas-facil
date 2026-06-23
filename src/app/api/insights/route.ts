import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken } from '@/lib/auth'
import { findUserById } from '@/lib/db'
import { generateInsights } from '@/lib/insights'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null
  if (!userId) return NextResponse.json({ insights: [] })

  const insights = await generateInsights(userId)
  return NextResponse.json({ insights })
}

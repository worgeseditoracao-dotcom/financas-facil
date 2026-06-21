import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { findUserById } from '@/lib/db'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('ff_session')?.value
    if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

    const userId = verifySessionToken(token)
    if (!userId) {
      cookieStore.delete('ff_session')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = findUserById(userId)
    if (!user || user.access_status !== 'active') {
      cookieStore.delete('ff_session')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, name: user.name, email: user.email, access_status: user.access_status },
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

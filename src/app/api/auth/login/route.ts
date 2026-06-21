import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { findUserByEmail } from '@/lib/db'
import { verifyPassword, createSessionToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })

    const user = await findUserByEmail(email.toLowerCase())
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    if (user.access_status === 'blocked') return NextResponse.json({ error: 'Acesso bloqueado' }, { status: 403 })
    if (user.access_status !== 'active') return NextResponse.json({ error: 'Acesso inativo' }, { status: 403 })
    if (!user.password_hash) return NextResponse.json({ error: 'Crie sua senha primeiro em "Primeiro Acesso"' }, { status: 400 })
    if (!verifyPassword(password, user.password_hash)) return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })

    const token = createSessionToken(user.id)
    const cookieStore = await cookies()

    cookieStore.set('ff_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: { id: user.id, name: user.name, email: user.email, access_status: user.access_status, access_type: user.access_type },
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

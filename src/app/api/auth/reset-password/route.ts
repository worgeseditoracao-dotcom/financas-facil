import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, updateUser } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e nova senha são obrigatórios' }, { status: 400 })
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Senha deve ter no mínimo 4 caracteres' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()
    const user = await findUserByEmail(emailLower)

    if (!user) {
      return NextResponse.json({ error: 'Nenhum usuário encontrado com este email' }, { status: 404 })
    }

    if (user.access_status === 'blocked') {
      return NextResponse.json({ error: 'Este acesso está bloqueado. Entre em contato com o suporte.' }, { status: 403 })
    }

    const hashed = hashPassword(password)
    await updateUser(emailLower, { password_hash: hashed })

    return NextResponse.json({
      ok: true,
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
  }
}

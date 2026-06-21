import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail, updateUser } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })
    if (password.length < 4) return NextResponse.json({ error: 'Senha deve ter no mínimo 4 caracteres' }, { status: 400 })

    const user = findUserByEmail(email.toLowerCase())
    if (!user || user.access_status !== 'active') {
      return NextResponse.json({ error: 'Nenhuma compra ativa encontrada com este e-mail' }, { status: 404 })
    }

    updateUser(email.toLowerCase(), { password_hash: hashPassword(password) })

    return NextResponse.json({ message: 'Senha criada com sucesso! Faça login.' })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

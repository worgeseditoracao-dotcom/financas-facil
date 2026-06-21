import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

    const user = await findUserByEmail(email.toLowerCase())
    if (!user || user.access_status !== 'active') {
      return NextResponse.json({
        exists: false,
        message: 'Não encontramos uma compra ativa com este e-mail. Verifique se digitou o mesmo e-mail usado na compra.',
      })
    }

    const hasPassword = !!user.password_hash

    return NextResponse.json({
      exists: true,
      hasPassword,
      message: hasPassword ? 'E-mail verificado. Faça login.' : 'E-mail verificado. Crie sua senha.',
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

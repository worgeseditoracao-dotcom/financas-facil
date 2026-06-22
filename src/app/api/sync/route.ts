import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { findUserByEmail, createUser, updateUser } from '@/lib/db'

// Sincronização manual — ativa acesso por email (caso o webhook não dispare)
export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

    const emailLower = email.toLowerCase().trim()

    const existing = await findUserByEmail(emailLower)
    if (existing) {
      if (existing.access_status === 'active') {
        return NextResponse.json({ ok: true, message: 'Usuário já está ativo', user: { id: existing.id, email: existing.email } })
      }
      const user = await updateUser(emailLower, {
        access_status: 'active',
        access_type: 'lifetime',
        blocked_reason: undefined,
        blocked_at: undefined,
      })
      return NextResponse.json({ ok: true, message: 'Acesso reativado', user: { id: user!.id, email: user!.email } })
    }

    const user = await createUser({
      id: uuid(),
      name: name || emailLower,
      email: emailLower,
      password_hash: '',
      auth_provider: 'email',
      role: 'user',
      access_status: 'active',
      access_type: 'lifetime',
    })

    return NextResponse.json({ ok: true, message: 'Usuário criado e acesso ativado', user: { id: user.id, email: user.email } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
  }
}

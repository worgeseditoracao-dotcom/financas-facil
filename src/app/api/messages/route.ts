import { NextRequest, NextResponse } from 'next/server'
import { getMessages, sendMessage, replyToMessage } from '@/lib/messages'
import { verifySessionToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { findUserById } from '@/lib/db'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('ff_session')?.value
  const userId = token ? verifySessionToken(token) : null

  let messages = await getMessages()

  if (userId) {
    const user = await findUserById(userId)
    if (user?.role === 'admin') {
      return NextResponse.json({ messages })
    }
    // Usuário comum: vê suas mensagens e respostas do admin
    messages = messages.filter(m => m.from_user_id === userId)
  }

  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('ff_session')?.value
    const userId = token ? verifySessionToken(token) : null
    if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const user = await findUserById(userId)
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const { message, replyToId } = await req.json()

    // Admin respondendo
    if (user.role === 'admin' && replyToId) {
      const updated = await replyToMessage(replyToId, message)
      return NextResponse.json({ ok: true, message: updated })
    }

    // Usuário enviando nova mensagem
    if (message) {
      const msg = await sendMessage({ from_user_id: userId, from_email: user.email, message })
      return NextResponse.json({ ok: true, message: msg })
    }

    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = [
  '/pessoal', '/negocio', '/categorias', '/relatorios', '/configuracoes',
  '/investimentos', '/metas', '/planejamento', '/contas-bancarias',
  '/conciliacao', '/contas', '/receber', '/fornecedores', '/clientes',
  '/cartoes', '/insights',
]

const PUBLIC_PREFIXES = ['/vendas', '/login', '/primeiro-acesso', '/acesso-bloqueado', '/api']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/webhooks/cakto')) return NextResponse.next()
  if (pathname.startsWith('/api/auth')) return NextResponse.next()

  const session = request.cookies.get('ff_session')?.value
  const isPublic = PUBLIC_PREFIXES.some(p => pathname.startsWith(p))
  const isProtected = pathname === '/' || PROTECTED_PREFIXES.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/vendas', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)'],
}

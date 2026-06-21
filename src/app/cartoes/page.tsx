'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CardsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/contas') }, [router])
  return <div className="flex items-center justify-center h-64 text-zinc-500">Redirecionando para Contas a Pagar...</div>
}

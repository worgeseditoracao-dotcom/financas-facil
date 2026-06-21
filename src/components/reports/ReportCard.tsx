'use client'

import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
}

export default function ReportCard({ title, children }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-500">{title}</h3>
      {children}
    </div>
  )
}
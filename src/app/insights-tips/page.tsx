'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, PiggyBank, Zap } from 'lucide-react'

const iconMap: Record<string, any> = { TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, PiggyBank, Zap }
const colorMap: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20',
  danger: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
  info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20',
}
const iconColorMap: Record<string, string> = {
  success: 'text-emerald-600', warning: 'text-amber-600', danger: 'text-red-600', info: 'text-blue-600',
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/insights')
      const data = await res.json()
      setInsights(data.insights || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Insights & Dicas</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Análises personalizadas baseadas nos seus dados</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-emerald-500" /></div>
      ) : insights.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <Lightbulb size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum insight ainda</p>
          <p className="text-xs mt-1">Cadastre produtos e registre vendas para receber análises inteligentes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight: any) => (
            <div key={insight.id} className={`rounded-2xl border p-5 ${colorMap[insight.type] || ''}`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 mt-0.5 ${iconColorMap[insight.type] || ''}`}>
                  <Lightbulb size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{insight.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{insight.message}</p>
                  <div className="mt-3 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20">
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">💡 Sugestão:</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{insight.suggestion}</p>
                  </div>
                  {insight.impact && (
                    <p className="text-xs text-zinc-500 mt-2 italic">📈 {insight.impact}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={load} className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800">
        🔄 Atualizar Análises
      </button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, Info, FileText } from 'lucide-react'

const MEI_TABLE: Record<string, number> = {
  'comercio': 67.00, 'industria': 68.90, 'servicos': 72.90,
  'transporte': 169.44, // Transporte intermunicipal
  'passageiros': 184.44, // Transporte de passageiros
}

const MEI_ANNUAL_LIMIT = 81000.00
const MEI_MONTHLY_LIMIT = 6750.00

const SIMPLES_ATTACHMENTS = [
  { name: 'Comércio', min: 0, max: 180000, aliquot: 4.0, deduction: 0 },
  { name: 'Comércio', min: 180000, max: 360000, aliquot: 7.3, deduction: 5940 },
  { name: 'Comércio', min: 360000, max: 720000, aliquot: 9.5, deduction: 13860 },
  { name: 'Comércio', min: 720000, max: 1800000, aliquot: 10.7, deduction: 22500 },
  { name: 'Serviços', min: 0, max: 180000, aliquot: 6.0, deduction: 0 },
  { name: 'Serviços', min: 180000, max: 360000, aliquot: 11.2, deduction: 9360 },
  { name: 'Serviços', min: 360000, max: 720000, aliquot: 13.5, deduction: 17640 },
  { name: 'Serviços', min: 720000, max: 1800000, aliquot: 16.0, deduction: 35640 },
]

function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function CalculadoraImpostos() {
  const [faturamento, setFaturamento] = useState('')
  const [tipo, setTipo] = useState<'mei' | 'simples'>('mei')
  const [categoria, setCategoria] = useState('comercio')
  const [simplesTipo, setSimplesTipo] = useState<'Comércio' | 'Serviços'>('Serviços')

  const monthlyRevenue = parseFloat(faturamento) || 0
  const annualRevenue = monthlyRevenue * 12

  // MEI
  const meiDAS = MEI_TABLE[categoria] || 72.90
  const meiOverLimit = monthlyRevenue > MEI_MONTHLY_LIMIT || annualRevenue > MEI_ANNUAL_LIMIT
  const meiAnnual = annualRevenue > 0 ? meiDAS * 12 : 0
  const meiEffective = monthlyRevenue > 0 ? (meiDAS / monthlyRevenue) * 100 : 0

  // Simples Nacional
  const bracket = SIMPLES_ATTACHMENTS.find(a => a.name === simplesTipo && annualRevenue >= a.min && annualRevenue < a.max)
    || SIMPLES_ATTACHMENTS.filter(a => a.name === simplesTipo).pop()
  const simplesAliquot = bracket?.aliquot || 6.0
  const simplesDeduction = bracket?.deduction || 0
  const simplesAnnual = Math.max(0, (annualRevenue * simplesAliquot / 100) - simplesDeduction)
  const simplesMonthly = simplesAnnual / 12
  const simplesEffective = monthlyRevenue > 0 ? (simplesMonthly / monthlyRevenue) * 100 : 0

  // Comparison
  const saving = meiAnnual - simplesAnnual
  const better = saving > 0 ? 'Simples' : saving < 0 ? 'MEI' : 'Empate'

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Calculadora de Impostos</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">MEI e Simples Nacional</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-500">Faturamento Mensal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <input type="number" step="0.01" placeholder="0,00" value={faturamento}
                onChange={e => setFaturamento(e.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 pl-10 pr-3 text-lg font-medium text-zinc-900 dark:text-zinc-50" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setTipo('mei')} className={`flex-1 rounded-xl py-3 text-sm font-medium ${tipo === 'mei' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'}`}>
              MEI
            </button>
            <button onClick={() => setTipo('simples')} className={`flex-1 rounded-xl py-3 text-sm font-medium ${tipo === 'simples' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'}`}>
              Simples Nacional
            </button>
          </div>

          {tipo === 'mei' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-500">Categoria MEI</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50">
                <option value="comercio">Comércio / Indústria (R$ 67,00)</option>
                <option value="industria">Indústria (R$ 68,90)</option>
                <option value="servicos">Serviços (R$ 72,90)</option>
                <option value="transporte">Transporte (R$ 169,44)</option>
              </select>
            </div>
          )}

          {tipo === 'simples' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-500">Anexo Simples</label>
              <select value={simplesTipo} onChange={e => setSimplesTipo(e.target.value as any)}
                className="h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm text-zinc-900 dark:text-zinc-50">
                <option value="Comércio">Anexo I - Comércio</option>
                <option value="Serviços">Anexo III - Serviços</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {monthlyRevenue > 0 && (
        <>
          {tipo === 'mei' && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-emerald-500" /> Resultado MEI
              </h2>

              {meiOverLimit && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 mb-4 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">Seu faturamento ultrapassa o limite MEI (R$ 6.750/mês ou R$ 81.000/ano). Você precisa migrar para ME ou Simples Nacional.</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">DAS Mensal</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatMoney(meiDAS)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">DAS Anual</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatMoney(meiAnnual)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500">% Efetiva sobre faturamento</span>
                  <span className="font-bold text-emerald-600">{meiEffective.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Valor que sobra por mês</span>
                  <span className="font-bold text-emerald-600">{formatMoney(monthlyRevenue - meiDAS)}</span>
                </div>
              </div>
            </div>
          )}

          {tipo === 'simples' && (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" /> Resultado Simples Nacional
              </h2>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 mb-4">
                <p className="text-xs text-blue-600">Alíquota efetiva: {simplesAliquot}% · Faixa: até {formatMoney(annualRevenue < 180000 ? 180000 : annualRevenue < 360000 ? 360000 : annualRevenue < 720000 ? 720000 : 1800000)}/ano</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Imposto Mensal (estimado)</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatMoney(simplesMonthly)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Imposto Anual (estimado)</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{formatMoney(simplesAnnual)}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-zinc-100 dark:border-zinc-700">
                  <span className="text-zinc-500">% Efetiva sobre faturamento</span>
                  <span className="font-bold text-blue-600">{simplesEffective.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Valor que sobra por mês</span>
                  <span className="font-bold text-blue-600">{formatMoney(monthlyRevenue - simplesMonthly)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Comparativo */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-purple-500" /> Comparativo MEI x Simples
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-xs text-emerald-600 font-medium">MEI (anual)</p>
                <p className="text-lg font-bold text-emerald-700">{formatMoney(meiAnnual)}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-xs text-blue-600 font-medium">Simples (anual)</p>
                <p className="text-lg font-bold text-blue-700">{formatMoney(simplesAnnual)}</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100 text-center">
              <p className="text-sm text-purple-700">
                {better === 'Empate' ? 'Empate nos dois regimes' :
                  `Para este faturamento, o regime mais vantajoso é: `}
                <span className="font-bold">{better === 'Empate' ? '' : better}</span>
              </p>
              {saving !== 0 && (
                <p className="text-xs text-purple-500 mt-1">
                  Economia anual de {formatMoney(Math.abs(saving))} em relação ao outro regime
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3 flex items-center gap-2">
          <Info size={16} className="text-zinc-500" /> Informações importantes
        </h2>
        <div className="space-y-2 text-xs text-zinc-500">
          <p>• <strong>MEI:</strong> Limite R$ 81.000/ano. DAS mensal fixo por categoria. Não pode ter sócio.</p>
          <p>• <strong>Simples Nacional:</strong> Alíquota progressiva conforme faturamento. Permite sócios.</p>
          <p>• <strong>ISS:</strong> Serviços municipais podem ter ISS adicional (2-5%) dependendo da cidade.</p>
          <p>• <strong>ICMS:</strong> Comércio e indústria podem ter ICMS dependendo do estado e produto.</p>
          <p className="text-zinc-400 mt-2">Esta é uma estimativa simplificada. Consulte um contador para valores exatos.</p>
        </div>
      </div>
    </div>
  )
}

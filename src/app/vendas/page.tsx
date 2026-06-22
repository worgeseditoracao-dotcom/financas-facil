'use client'

import { useState, useEffect, useRef } from 'react'
import { CAKTO_CHECKOUT_URL } from '@/lib/config'
import {
  Check, Shield, Zap, Star, ChevronDown, ChevronUp, ArrowRight,
  TrendingUp, PiggyBank, BarChart3, Target, CreditCard, FileText,
  Smartphone, Building2, DollarSign, Clock, Wallet, Users, X
} from 'lucide-react'

const APP_NAME = 'ECONOMIZZEI'
const PRICE_PROMO = 'R$ 67,90'
const PRICE_NORMAL = 'R$ 87,90'
const COLOR = '#8B5CF6'
const CHECKOUT = CAKTO_CHECKOUT_URL || '#'
const TOTAL_LICENSES = 100
const SOLD_LICENSES = 87
const REMAINING = TOTAL_LICENSES - SOLD_LICENSES

function trackEvent(name: string) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', name)
  }
}

function CTAButton({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <a href={CHECKOUT} target="_blank" rel="noopener noreferrer"
      onClick={() => trackEvent('CTAClick')}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 ${className}`}
      style={{ backgroundColor: COLOR }}>
      {children}
    </a>
  )
}

export default function EconomizzeiPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showFloatingCTA, setShowFloatingCTA] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [animatedNumbers, setAnimatedNumbers] = useState({ users: 0, saved: 0 })

  useEffect(() => {
    window.addEventListener('scroll', () => setShowFloatingCTA(window.scrollY > 400))
    return () => window.removeEventListener('scroll', () => {})
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setShowVideo(true)
    }, { threshold: 0.5 })
    if (videoRef.current) observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const animate = () => {
      const target1 = 3200; const target2 = 210000
      let frame = 0; const total = 60
      const timer = setInterval(() => {
        frame++
        setAnimatedNumbers({
          users: Math.floor((frame / total) * target1),
          saved: Math.floor((frame / total) * target2),
        })
        if (frame >= total) clearInterval(timer)
      }, 30)
      return () => clearInterval(timer)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { animate(); observer.disconnect() }
    })
    const el = document.getElementById('stats-section')
    if (el) observer.observe(el)
  }, [])

  const screenshots = Array.from({ length: 6 }, (_, i) => `/screen${i + 1}.png`)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0F0A1A 0%, #1A1030 100%)' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .6; } }
        @keyframes slideRight { from { width: 0% } to { width: ${SOLD_LICENSES}% } }
        .animate-fade-in { animation: fadeInUp .8s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .delay-1 { animation-delay: .1s; } .delay-2 { animation-delay: .2s; } .delay-3 { animation-delay: .3s; } .delay-4 { animation-delay: .4s; }
        .progress-bar { animation: slideRight 1.5s ease-out forwards; }
        .glass { background: rgba(255,255,255,.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.1); }
        .hero-glow { box-shadow: 0 0 80px rgba(139,92,246,.3); }
        
        #floating-btn { transform: translateX(150%); transition: transform .3s ease; }
        #floating-btn.visible { transform: translateX(0); }
        
        .carousel-dot { transition: all .3s ease; }
        .carousel-dot.active { background: ${COLOR}; width: 24px; border-radius: 4px; }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${COLOR}40; border-radius: 2px; }
      `}</style>

      {/* ====== FLOATING CTA MOBILE ====== */}
      <div id="floating-btn" className={`${showFloatingCTA ? 'visible' : ''} fixed bottom-0 left-0 right-0 z-50 p-3 glass md:hidden`}>
        <a href={CHECKOUT} target="_blank" rel="noopener noreferrer"
          onClick={() => trackEvent('FloatingCTA')}
          className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg active:scale-[.98]"
          style={{ background: COLOR }}>
          <Zap size={16} /> QUERO MINHA LICENÇA POR {PRICE_PROMO}
        </a>
      </div>

      {/* ====== 1. HERO ====== */}
      <section className="relative overflow-hidden px-4 pt-8 pb-16 md:pt-16 md:pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: COLOR }} />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10 blur-3xl" style={{ background: '#06B6D4' }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-6 animate-fade-in">
            <Zap size={12} /> Licença Vitalícia • 7 Dias de Garantia
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight animate-fade-in">
            Controle total das suas <span style={{ color: COLOR }}>finanças pessoais</span> e{' '}
            <span style={{ color: '#06B6D4' }}>empresariais</span> em um único lugar
          </h1>

          <p className="mt-4 md:mt-6 text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto animate-fade-in delay-1">
            Organize receitas, despesas, metas, cartões, relatórios e fluxo de caixa com um app simples, poderoso e acessível.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in delay-2">
            <CTAButton className="px-8 py-4 text-base md:text-lg w-full sm:w-auto">
              <Zap size={20} /> QUERO MINHA LICENÇA
            </CTAButton>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 animate-fade-in delay-2">
            <span className="flex items-center gap-1 text-xs text-zinc-400"><Shield size={12} className="text-emerald-400" /> 7 dias de garantia</span>
            <span className="flex items-center gap-1 text-xs text-zinc-400"><Clock size={12} className="text-cyan-400" /> Acesso vitalício</span>
          </div>

          <div className="mt-5 text-xs text-zinc-500 animate-fade-in delay-2">
            De <span className="line-through text-zinc-600">{PRICE_NORMAL}</span> por <span className="text-white font-bold">{PRICE_PROMO}</span>
          </div>

          {/* Mockup */}
          <div className="mt-10 mx-auto max-w-sm animate-fade-in delay-3">
            <div className="hero-glow rounded-3xl overflow-hidden border-2 border-white/10">
              <div className="aspect-[9/16] bg-zinc-900 flex items-center justify-center relative">
                <div className="text-center">
                  <Wallet size={48} className="mx-auto mb-2 opacity-30" style={{ color: COLOR }} />
                  <p className="text-xs text-zinc-600">Dashboard Financeiro</p>
                  <div className="mt-3 space-y-1.5 px-8">
                    <div className="h-2 rounded-full" style={{ background: COLOR, width: '80%' }} />
                    <div className="h-2 rounded-full bg-zinc-800 w-full" />
                    <div className="h-2 rounded-full bg-zinc-800 w-3/4" />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="h-12 rounded-xl bg-zinc-800" />
                      <div className="h-12 rounded-xl bg-zinc-800" />
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A1A] via-transparent to-transparent" />
                <p className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-zinc-500">{APP_NAME} Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 2. ESCASSEZ ====== */}
      <section className="px-4 py-12 border-t border-white/5">
        <div className="mx-auto max-w-xl text-center animate-fade-in">
          <div className="glass rounded-2xl p-6">
            <p className="text-sm text-zinc-300 mb-3">
              <span className="font-bold text-white">{SOLD_LICENSES}</span> de <span className="font-bold text-white">{TOTAL_LICENSES}</span> licenças promocionais vendidas
            </p>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full progress-bar rounded-full" style={{ background: `linear-gradient(90deg, ${COLOR}, #06B6D4)` }} />
            </div>
            <p className="mt-3 text-sm font-bold animate-pulse-slow" style={{ color: COLOR }}>
              ⚡ Restam apenas {REMAINING} licenças pelo valor promocional
            </p>
          </div>
        </div>
      </section>

      {/* ====== 3. VÍDEO ====== */}
      <section ref={videoRef} className="px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Veja como é simples</h2>
          <div className="glass rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
            {showVideo ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: COLOR }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                  </div>
                  <p className="text-sm text-zinc-400">Demonstração do {APP_NAME}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====== 4. DOR ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">Você se identifica?</h2>
          <p className="text-sm text-zinc-400 text-center mb-10">Problemas financeiros que acabam HOJE</p>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '💸', text: 'Não sabe para onde o dinheiro vai no fim do mês' },
              { icon: '🔀', text: 'Mistura dinheiro pessoal com o da empresa' },
              { icon: '📅', text: 'Esquece datas de vencimento e paga juros' },
              { icon: '📊', text: 'Não sabe o lucro real do seu negócio' },
              { icon: '😰', text: 'Ansiedade e estresse por falta de controle' },
              { icon: '📉', text: 'Perde oportunidades por falta de organização' },
            ].map((problem, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-start gap-3 animate-fade-in delay-1">
                <span className="text-2xl shrink-0">{problem.icon}</span>
                <p className="text-sm text-zinc-300 leading-relaxed">{problem.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 5. SOLUÇÃO ====== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">O {APP_NAME} resolve isso</h2>
          <p className="text-sm text-zinc-400 mb-10">Tudo que você precisa em um só app</p>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            {[
              { icon: TrendingUp, label: 'Organização', color: '#22C55E' },
              { icon: BarChart3, label: 'Controle', color: '#3B82F6' },
              { icon: PiggyBank, label: 'Economia', color: '#F59E0B' },
              { icon: Target, label: 'Crescimento', color: COLOR },
              { icon: Zap, label: 'Facilidade', color: '#06B6D4' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center gap-3 animate-fade-in">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: item.color + '20' }}>
                  <item.icon size={24} style={{ color: item.color }} />
                </div>
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 6. FINANÇAS PESSOAIS ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 mb-4">Pessoa Física</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Finanças Pessoais</h2>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: DollarSign, title: 'Receitas', desc: 'Registre todas as entradas' },
              { icon: CreditCard, title: 'Despesas', desc: 'Categorize cada gasto' },
              { icon: Target, title: 'Metas', desc: 'Defina e acompanhe objetivos' },
              { icon: CreditCard, title: 'Cartões', desc: 'Controle limite e faturas' },
              { icon: BarChart3, title: 'Gráficos', desc: 'Visualize seus dados' },
              { icon: FileText, title: 'Relatórios', desc: 'Exporte em PDF e Excel' },
              { icon: Calendar, title: 'Planejamento', desc: 'Orçamento mensal' },
              { icon: TrendingUp, title: 'Investimentos', desc: 'Simule rendimentos' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: COLOR + '20' }}>
                  <f.icon size={16} style={{ color: COLOR }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 7. FINANÇAS EMPRESARIAIS ====== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-4">Empresarial</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Finanças Empresariais</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TrendingUp, title: 'Fluxo de Caixa', desc: 'Entradas e saídas em tempo real' },
              { icon: DollarSign, title: 'Receitas', desc: 'Acompanhe seu faturamento' },
              { icon: CreditCard, title: 'Despesas', desc: 'Custos operacionais' },
              { icon: BarChart3, title: 'Lucro Mensal', desc: 'Resultado líquido automático' },
              { icon: Target, title: 'Margem de Lucro', desc: 'Indicador em percentual' },
              { icon: Building2, title: 'DRE Simplificado', desc: 'Demonstrativo de resultado' },
              { icon: FileText, title: 'Relatórios', desc: 'Gerenciais completos' },
              { icon: Users, title: 'Clientes', desc: 'Gestão de carteira' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#06B6D4' + '20' }}>
                  <f.icon size={16} style={{ color: '#06B6D4' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{f.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 8. GALERIA ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">Conheça o aplicativo</h2>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))} className="p-2 rounded-xl glass text-zinc-400 hover:text-white">
              <ChevronDown size={20} className="rotate-90" />
            </button>
            <div className="glass rounded-3xl overflow-hidden w-full max-w-xs">
              <div className="aspect-[9/16] bg-zinc-900 flex items-center justify-center relative">
                <div className="text-center">
                  <Wallet size={48} className="mx-auto mb-4 opacity-30" style={{ color: COLOR }} />
                  <div className="space-y-2 px-8">
                    <div className="h-1.5 rounded-full" style={{ background: COLOR, width: '60%' }} />
                    <div className="h-1.5 rounded-full bg-zinc-800 w-full" />
                    <div className="h-1.5 rounded-full bg-zinc-800 w-4/5" />
                  </div>
                  <p className="mt-4 text-[10px] text-zinc-500">Tela {carouselIndex + 1} de {screenshots.length}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setCarouselIndex(Math.min(screenshots.length - 1, carouselIndex + 1))} className="p-2 rounded-xl glass text-zinc-400 hover:text-white">
              <ChevronDown size={20} className="-rotate-90" />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {screenshots.map((_, i) => (
              <button key={i} onClick={() => setCarouselIndex(i)}
                className={`carousel-dot h-2 rounded-full transition-all ${i === carouselIndex ? 'active' : 'bg-zinc-700 w-2'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== 9. COMPARATIVO ====== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">Antes e depois do {APP_NAME}</h2>
          
          <div className="glass rounded-3xl overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="p-5 md:p-8 border-r border-white/5">
                <p className="text-sm font-medium text-red-400 mb-4">😰 Sem {APP_NAME}</p>
                {['Dinheiro sem controle', 'Planilhas confusas', 'Sem visão do lucro', 'Estresse financeiro', 'Decisões no escuro'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                    <X size={14} className="text-red-500 shrink-0" />
                    <span className="text-xs text-zinc-400 text-left">{t}</span>
                  </div>
                ))}
              </div>
              <div className="p-5 md:p-8" style={{ background: COLOR + '10' }}>
                <p className="text-sm font-medium text-emerald-400 mb-4">😎 Com {APP_NAME}</p>
                {['Controle total em tempo real', 'App intuitivo e rápido', 'Lucro calculado automaticamente', 'Paz e tranquilidade', 'Decisões baseadas em dados'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0">
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span className="text-xs text-zinc-300 text-left">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 10. BENEFÍCIOS ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Benefícios</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Mais organização', desc: 'Tudo categorizado e acessível em segundos' },
              { title: 'Menos estresse', desc: 'Saiba exatamente sua situação financeira' },
              { title: 'Controle completo', desc: 'Pessoal e empresarial no mesmo app' },
              { title: 'Economia de tempo', desc: 'Nada de planilhas complexas' },
              { title: 'Decisões inteligentes', desc: 'Relatórios e gráficos automáticos' },
              { title: 'Crescimento saudável', desc: 'Acompanhe metas e investimentos' },
            ].map((b, i) => (
              <div key={i} className="glass rounded-2xl p-5 animate-fade-in">
                <Check size={16} className="text-emerald-400 mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">{b.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 11. DEPOIMENTOS ====== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Quem usa recomenda</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: 'Ana S.', role: 'Autônoma', text: 'Finalmente sei para onde vai meu dinheiro. O app é incrível!' },
              { name: 'Carlos M.', role: 'MEI', text: 'Consigo controlar meu negócio e minhas contas pessoais no mesmo lugar.' },
              { name: 'Juliana R.', role: 'Estudante', text: 'Organizei minhas finanças e já estou economizando para minha meta.' },
            ].map((d, i) => (
              <div key={i} className="glass rounded-2xl p-5 animate-fade-in">
                <div className="flex gap-1 mb-2">{Array(5).fill(0).map((_, j) => <Star key={j} size={12} fill="#F59E0B" color="#F59E0B" />)}</div>
                <p className="text-xs text-zinc-300 leading-relaxed mb-3">{d.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: COLOR }}>{d.name[0]}</div>
                  <div><p className="text-xs font-medium text-white">{d.name}</p><p className="text-[10px] text-zinc-500">{d.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 12. GARANTIA ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-xl text-center">
          <div className="glass rounded-3xl p-8 animate-fade-in">
            <Shield size={48} className="mx-auto mb-4 text-emerald-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Garantia de 7 dias</h2>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Teste o {APP_NAME} sem risco. Se por qualquer motivo não gostar, devolvemos 100% do seu dinheiro em até 7 dias. Sem perguntas, sem burocracia.
            </p>
            <p className="mt-4 text-xs text-emerald-400 font-medium">✅ Risco zero para você</p>
          </div>
        </div>
      </section>

      {/* ====== 13. FAQ ====== */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-10">Perguntas Frequentes</h2>
          <div className="space-y-2">
            {[
              { q: 'O pagamento é único?', a: 'Sim! Você paga apenas uma vez e tem acesso vitalício ao ECONOMIZZEI, incluindo todas as atualizações futuras.' },
              { q: 'Funciona para empresas?', a: 'Sim. O ECONOMIZZEI tem módulos separados para finanças pessoais e empresariais. Perfeito para MEIs e pequenos negócios.' },
              { q: 'Funciona para pessoa física?', a: 'Sim. Controle total de receitas, despesas, metas, cartões, investimentos e relatórios.' },
              { q: 'Terei atualizações?', a: 'Sim. Todas as atualizações são gratuitas e automáticas. Você sempre terá a versão mais recente.' },
              { q: 'Como recebo o acesso?', a: 'Após a compra, você recebe um e-mail com as instruções para criar sua senha e acessar o sistema.' },
              { q: 'Posso usar no celular?', a: 'Sim. O ECONOMIZZEI funciona em qualquer dispositivo: celular, tablet e computador. 100% responsivo.' },
              { q: 'Tem suporte?', a: 'Sim. Nosso time de suporte responde em até 48 horas. Você também tem acesso ao chat dentro do app.' },
            ].map((faq, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-zinc-500 shrink-0" /> : <ChevronDown size={16} className="text-zinc-500 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/5">
                    <p className="text-sm text-zinc-400 leading-relaxed mt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 14 & 15. OFERTA FINAL + STATS ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glass rounded-3xl p-8 md:p-12 animate-fade-in" style={{ borderColor: COLOR + '40' }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-4">
              <Zap size={12} /> Oferta Especial
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white">Pronto para transformar suas finanças?</h2>
            <p className="mt-3 text-sm text-zinc-400">Licença vitalícia por um valor que você nunca mais vai encontrar</p>

            <div className="mt-6">
              <span className="text-5xl md:text-6xl font-extrabold text-white">{PRICE_PROMO}</span>
              <p className="text-sm text-zinc-500 mt-1">ou 12x de R$ 6,79 no cartão</p>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              De <span className="line-through">{PRICE_NORMAL}</span> por <span className="text-emerald-400 font-semibold">{PRICE_PROMO}</span> • Você economiza R$ 20,00
            </p>

            <CTAButton className="px-10 py-4 text-lg w-full mt-6">
              <Zap size={22} /> QUERO MINHA LICENÇA AGORA
            </CTAButton>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" /> 7 dias de garantia</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" /> Vitalício</span>
              <span className="flex items-center gap-1"><Smartphone size={12} className="text-zinc-500" /> Multi-dispositivo</span>
            </div>
          </div>

          {/* Stats */}
          <div id="stats-section" className="grid grid-cols-2 gap-4 mt-10">
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-extrabold text-white">{animatedNumbers.users.toLocaleString()}+</p>
              <p className="text-xs text-zinc-500 mt-1">Usuários ativos</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-3xl font-extrabold text-white">R$ {animatedNumbers.saved.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 mt-1">Economizados pelos usuários</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <p className="text-xs text-zinc-600">{APP_NAME} © {new Date().getFullYear()} · Todos os direitos reservados</p>
        <p className="text-[10px] text-zinc-700 mt-1">7 dias de garantia · Acesso vitalício · Suporte em até 48h</p>
      </footer>
    </div>
  )
}

function Calendar(props: any) { return <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }

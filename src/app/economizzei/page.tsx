'use client'

import { useState, useEffect, useRef } from 'react'
import { CAKTO_CHECKOUT_URL } from '@/lib/config'
import {
  Check, Shield, Zap, Star, ChevronDown, ChevronUp, ArrowRight, ArrowDown,
  TrendingUp, PiggyBank, BarChart3, Target, CreditCard, FileText,
  Smartphone, Building2, DollarSign, Clock, Wallet, Users, X, Play, Send
} from 'lucide-react'

const APP = 'ECONOMIZZEI'
const PRICE_PROMO = '67,90'
const PRICE_NORMAL = '87,90'
const PRICE_NEXT_LOT = '97,90'
const COLOR = '#8B5CF6'
const CYAN = '#06B6D4'
const CHECKOUT = CAKTO_CHECKOUT_URL || '#'
const LICENSES_TOTAL = 100
const LICENSES_SOLD = 87
const REMAINING = LICENSES_TOTAL - LICENSES_SOLD

const individualPrices = [
  { name: 'Controle Financeiro Pessoal', price: '47,90' },
  { name: 'Controle de Cartões', price: '37,90' },
  { name: 'Metas Financeiras', price: '29,90' },
  { name: 'Planejamento Orçamentário', price: '39,90' },
  { name: 'Controle de Investimentos', price: '47,90' },
  { name: 'Fluxo de Caixa Empresarial', price: '67,90' },
  { name: 'Contas a Pagar', price: '29,90' },
  { name: 'Dashboard Inteligente', price: '39,90' },
]
const totalSeparado = individualPrices.reduce((acc, p) => acc + parseFloat(p.price), 0)

function track(name: string) { try { (window as any).fbq?.('trackCustom', name) } catch {} }

function CTA({ children, large, full }: { children: React.ReactNode; large?: boolean; full?: boolean }) {
  return (
    <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={() => track('CTA')}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[.97] hover:shadow-2xl ${large ? 'px-10 py-5 text-lg' : 'px-6 py-3.5 text-sm md:text-base'} ${full ? 'w-full' : ''}`}
      style={{ background: `linear-gradient(135deg, ${COLOR}, #7C3AED)` }}>
      {children}
    </a>
  )
}

function Badge({ children, color = CYAN }: { children: React.ReactNode; color?: string }) {
  return <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] md:text-xs font-medium border" style={{ borderColor: color + '40', background: color + '15', color }}>{children}</div>
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-8 md:mb-12">
      <h2 className="text-2xl md:text-4xl font-extrabold text-white">{children}</h2>
      {sub && <p className="mt-2 md:mt-3 text-sm md:text-base text-zinc-400 max-w-xl mx-auto">{sub}</p>}
    </div>
  )
}

function GlassCard({ children, className = '', style = {}, onClick }: any) {
  return <div className={`rounded-2xl md:rounded-3xl p-5 md:p-6 border border-white/10 ${className}`} style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(10px)', ...style }} onClick={onClick}>{children}</div>
}

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>{children}</div>
}

export default function VendasPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const animNums = useRef({ users: 0, saved: 0 })
  const [nums, setNums] = useState({ users: 0, saved: 0 })
  const [priceStep, setPriceStep] = useState(0)
  const priceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const steps = [0, 1, 2, 3]
        steps.forEach((s, i) => setTimeout(() => setPriceStep(s), i * 500))
        obs.disconnect()
      }
    }, { threshold: 0.3 })
    if (priceRef.current) obs.observe(priceRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const t1 = 3200; const t2 = 210000
        let f = 0; const total = 50
        const t = setInterval(() => {
          f++
          setNums({ users: Math.floor((f / total) * t1), saved: Math.floor((f / total) * t2) })
          if (f >= total) clearInterval(t)
        }, 25)
        obs.disconnect()
      }
    })
    const el = document.getElementById('stats-section')
    if (el) obs.observe(el)
  }, [])

  const galleryItems = [
    { title: 'Dashboard Completo', desc: 'Visão geral de todas as suas finanças em tempo real', benefit: 'Tome decisões baseadas em dados' },
    { title: 'Controle de Cartões', desc: 'Gerencie limite, faturas e compras parceladas', benefit: 'Nunca mais perca o controle dos gastos' },
    { title: 'Metas Financeiras', desc: 'Defina objetivos e acompanhe o progresso', benefit: 'Realize seus sonhos mais rápido' },
    { title: 'Investimentos', desc: 'Simule rendimentos e acompanhe sua carteira', benefit: 'Faça seu dinheiro trabalhar por você' },
    { title: 'Finanças Empresariais', desc: 'Fluxo de caixa, DRE e margem de lucro', benefit: 'Saiba exatamente o lucro do seu negócio' },
    { title: 'Contas a Pagar', desc: 'Nunca esqueça um vencimento', benefit: 'Zero juros por atraso' },
  ]

  const testimonials = [
    { name: 'Mariana Silva', role: 'Empresária', img: '44', text: '"Eu misturava tudo, não sabia o lucro da minha loja. Com o ECONOMIZZEI agora vejo separadinho: pessoal de um lado, empresa do outro. Minha vida financeira mudou completamente."', result: 'Aumentou o lucro em 40%' },
    { name: 'Rafael Oliveira', role: 'MEI - Lanchonete', img: '12', text: '"Achava que app de finanças era complicado. Paguei 67 reais e em 1 mês já economizei mais de 300 reais só organizando meus gastos. Melhor investimento do ano."', result: 'Economizou R$ 300+ no 1º mês' },
    { name: 'Camila Santos', role: 'Autônoma', img: '5', text: '"Sou manicure e não tinha controle nenhum. Agora sei exatamente quanto entra, quanto sai e quanto sobra. Pela primeira vez estou conseguindo guardar dinheiro."', result: 'Primeira reserva financeira' },
    { name: 'Fernanda Lima', role: 'Dentista', img: '23', text: '"Atendo dezenas de pacientes por dia e nunca sabia meu faturamento real. O ECONOMIZZEI me deu clareza total. Hoje sei meu ticket médio, custos e lucro líquido."', result: 'Clareza total do negócio' },
    { name: 'Thiago Martins', role: 'Empreendedor', img: '60', text: '"Testei 4 apps antes. O ECONOMIZZEI foi o único que atendeu tanto o lado pessoal quanto minha loja de camisetas. Interface linda e super intuitiva."', result: 'Unificou finanças pessoais e empresa' },
    { name: 'Amanda Rocha', role: 'Dona de Casa', img: '48', text: '"Eu e meu marido brigávamos por dinheiro. Começamos a usar o ECONOMIZZEI juntos e agora temos metas como casal. Nossa relação melhorou muito!"', result: 'Metas financeiras em casal' },
  ]

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(180deg, #0A0614 0%, #100B20 50%, #0A0614 100%)', color: '#fff' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        @keyframes slideDown { from { max-height: 0; opacity: 0; } to { max-height: 500px; opacity: 1; } }
        @keyframes priceDrop { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.95); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-fade-in { animation: fadeIn .6s ease-out forwards; }
        .animate-fade-up { animation: fadeInUp .8s ease-out forwards; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .animate-bounce-in { animation: bounceIn .7s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-price { animation: priceDrop .5s ease-out forwards; }
        .animate-slide { animation: slideDown .5s ease-out forwards; overflow: hidden; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); background-size: 200% 100%; animation: shimmer 2s infinite; }
        .glass { background: rgba(255,255,255,.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.08); }
        .glass-strong { background: rgba(255,255,255,.08); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.12); }
        .hero-glow { box-shadow: 0 0 120px rgba(139,92,246,.25), 0 0 40px rgba(6,182,212,.1); }
        .price-strikethrough { text-decoration: line-through; }
        .scroll-smooth { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>

      {/* ====== TOP BAR ====== */}
      <div className="sticky top-0 z-50 border-b border-white/8" style={{ background: 'rgba(10,6,20,0.96)', backdropFilter: 'blur(16px)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-3 md:px-4 py-2 md:py-2.5">
          <div className="flex-1">
            <p className="text-[11px] md:text-xs text-zinc-400">
              <span className="text-white font-bold">{LICENSES_SOLD} licenças ativadas</span>
              <span className="hidden sm:inline"> · Restam {REMAINING} neste lote</span>
            </p>
            <div className="h-1 bg-white/5 rounded-full mt-1 hidden sm:block">
              <div className="h-full rounded-full" style={{ width: `${LICENSES_SOLD}%`, background: `linear-gradient(90deg, ${COLOR}, ${CYAN})` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 ml-3">
            <a href="/login" className="text-[11px] md:text-xs font-medium text-zinc-400 hover:text-white transition-colors whitespace-nowrap">
              Já comprei
            </a>
            <a href={CHECKOUT} target="_blank" rel="noopener noreferrer"
              className="rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${COLOR}, #7C3AED)` }}>
              R$ {PRICE_PROMO}
            </a>
          </div>
        </div>
      </div>

      {/* ====== 1. HERO ====== */}
      <section className="relative overflow-hidden px-4 pt-10 pb-20 md:pt-20 md:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-15 blur-[100px]" style={{ background: COLOR }} />
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full opacity-10 blur-[80px]" style={{ background: CYAN }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <Badge color={COLOR}><Zap size={12} /> Acesso Vitalício</Badge>
            <span className="mx-2" />
            <Badge><Shield size={12} /> 7 Dias de Garantia</Badge>
          </div>

          <h1 className="mt-6 text-[2rem] md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] animate-fade-in">
            O único app que{' '}
            <span style={{ background: `linear-gradient(135deg, ${COLOR}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              organiza suas finanças pessoais e empresariais
            </span>{' '}
            em um só lugar
          </h1>

          <p className="mt-4 md:mt-6 text-sm md:text-lg text-zinc-400 max-w-xl mx-auto animate-fade-in">
            Chega de planilhas confusas e apps separados. Controle receitas, despesas, cartões, metas, investimentos e fluxo de caixa da sua empresa com um sistema completo.
          </p>

          <div className="mt-8 animate-fade-in">
            <CTA large>QUERO MINHA LICENÇA AGORA <ArrowRight size={20} /></CTA>
            <p className="mt-3 text-xs md:text-sm text-zinc-500">
              De <span className="price-strikethrough text-zinc-600">R$ {PRICE_NORMAL}</span> por{' '}
              <span className="text-white font-bold">R$ {PRICE_PROMO}</span> · Acesso vitalício
            </p>
          </div>

          {/* Mockup */}
          <div className="mt-12 mx-auto max-w-[280px] md:max-w-sm animate-fade-in">
            <div className="hero-glow rounded-[2rem] overflow-hidden border border-white/10">
              <div className="aspect-[9/16] bg-[#0A0614] flex flex-col items-center justify-center p-4 relative">
                <div className="w-full space-y-2.5">
                  <div className="h-1.5 rounded-full" style={{ background: COLOR, width: '65%' }} />
                  <div className="h-1.5 rounded-full bg-white/10 w-full" />
                  <div className="h-1.5 rounded-full bg-white/10 w-4/5" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                  <div className="rounded-2xl p-3" style={{ background: COLOR + '15' }}>
                    <div className="h-1 rounded-full bg-white/20 w-3/4 mb-2" />
                    <div className="flex items-end gap-1">
                      <span className="text-lg font-bold" style={{ color: COLOR }}>+2,4k</span>
                    </div>
                  </div>
                  <div className="rounded-2xl p-3" style={{ background: CYAN + '15' }}>
                    <div className="h-1 rounded-full bg-white/20 w-3/4 mb-2" />
                    <div className="flex items-end gap-1">
                      <span className="text-lg font-bold" style={{ color: CYAN }}>-1,1k</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 w-full h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                  <BarChart3 size={24} className="opacity-30" style={{ color: COLOR }} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0614] h-16" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 2. ESCASSEZ ====== */}
      <section className="px-4 py-10 md:py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <GlassCard className="!bg-white/[.06]">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full animate-bounce-in" style={{ background: COLOR, animationDelay: `${i * 0.15}s` }} />)}
              </div>
              <p className="text-lg md:text-xl font-bold text-white">
                <span style={{ color: COLOR }}>{LICENSES_SOLD} licenças</span> já ativadas
              </p>
              <p className="text-sm text-zinc-400 mt-1">Restam apenas {REMAINING} neste lote promocional</p>
              <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full animate-pulse-slow" style={{ width: `${LICENSES_SOLD}%`, background: `linear-gradient(90deg, ${COLOR}, ${CYAN})` }} />
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: CYAN }}>Próximo lote: R$ {PRICE_NEXT_LOT}</p>
              <p className="mt-1 text-xs text-zinc-500">Economize R$ 30,00 comprando agora</p>
            </GlassCard>
          </div>
        </ScrollReveal>
      </section>

      <CTAInSection text="Garantir Minha Licença com Desconto" />

      {/* ====== 3. COMO FUNCIONA ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle sub="Comece em menos de 2 minutos">Como Funciona</SectionTitle>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { step: '1', icon: <Send size={20} />, title: 'Pagamento', desc: 'Pague via Pix, cartão ou boleto pela Cakto' },
              { step: '2', icon: <Zap size={20} />, title: 'Acesso', desc: 'Receba o acesso por e-mail em instantes' },
              { step: '3', icon: <Smartphone size={20} />, title: 'Login', desc: 'Entre na plataforma e crie sua senha' },
              { step: '4', icon: <TrendingUp size={20} />, title: 'Organize', desc: 'Comece a controlar suas finanças' },
            ].map((item, i) => (
              <ScrollReveal key={i} className="text-center" style={{ animationDelay: `${i * 0.15}s` } as any}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black" style={{ background: `linear-gradient(135deg, ${COLOR}, ${CYAN})` }}>
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl glass flex items-center justify-center" style={{ color: COLOR }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 4. DOR ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle sub="Problemas que acabam hoje">Você se identifica?</SectionTitle>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '💸', t: 'Não sabe para onde o dinheiro vai' },
              { icon: '🔀', t: 'Mistura finanças pessoais e da empresa' },
              { icon: '📅', t: 'Esquece vencimentos e paga juros' },
              { icon: '📊', t: 'Não sabe o lucro real do negócio' },
              { icon: '😰', t: 'Ansiedade por falta de controle' },
              { icon: '📉', t: 'Perde oportunidades por desorganização' },
            ].map((p, i) => (
              <ScrollReveal key={i}>
                <GlassCard className="flex items-start gap-3">
                  <span className="text-2xl animate-float" style={{ animationDelay: `${i * 0.4}s` }}>{p.icon}</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{p.t}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <CTA>Chega de Perder Dinheiro <ArrowRight size={16} /></CTA>
          </div>
        </div>
      </section>

      {/* ====== 5. SOLUÇÃO ====== */}
      <section className="px-4 py-16">
        <SectionTitle sub="Tudo que você precisa em um só app">O {APP} resolve</SectionTitle>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            {[
              { icon: TrendingUp, label: 'Organização', color: '#22C55E' },
              { icon: BarChart3, label: 'Controle', color: '#3B82F6' },
              { icon: PiggyBank, label: 'Economia', color: '#F59E0B' },
              { icon: Target, label: 'Crescimento', color: COLOR },
              { icon: Zap, label: 'Facilidade', color: CYAN },
            ].map((item, i) => (
              <ScrollReveal key={i}>
                <GlassCard className="flex flex-col items-center gap-2 p-4 md:p-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center" style={{ background: item.color + '20' }}>
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-white">{item.label}</span>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTAInSection text="Quero Organizar Minhas Finanças" />

      {/* ====== 6. GALERIA ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle sub="Conheça as principais telas do sistema">Galeria do App</SectionTitle>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex items-center gap-2 lg:hidden w-full justify-center">
              <button onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))} className="p-3 rounded-xl glass text-zinc-400 active:scale-95"><ChevronDown size={18} className="rotate-90" /></button>
              <div className="flex-1 max-w-[200px]">
                <div className="glass rounded-3xl overflow-hidden">
                  <div className="aspect-[9/16] bg-[#0A0614] flex flex-col items-center justify-center p-3 relative">
                    <div className="text-center space-y-1.5 w-full">
                      <div className="h-1 rounded-full" style={{ background: COLOR, width: '60%' }} />
                      <div className="h-1 rounded-full bg-white/10 w-full" />
                      <div className="h-1 rounded-full bg-white/10 w-4/5" />
                    </div>
                    <p className="absolute bottom-2 text-[9px] text-zinc-500">{galleryItems[carouselIndex].title}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setCarouselIndex(Math.min(galleryItems.length - 1, carouselIndex + 1))} className="p-3 rounded-xl glass text-zinc-400 active:scale-95"><ChevronDown size={18} className="-rotate-90" /></button>
            </div>

            <div className="hidden lg:grid grid-cols-3 gap-3 w-full">
              {galleryItems.map((item, i) => (
                <ScrollReveal key={i}>
                  <div className={`glass rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${i === carouselIndex ? 'ring-2' : ''}`}
                    style={i === carouselIndex ? { ringColor: COLOR } : {}}
                    onClick={() => setCarouselIndex(i)}>
                    <div className="aspect-[9/16] bg-[#0A0614] flex flex-col items-center justify-center p-3 relative">
                      <Wallet size={32} className="opacity-20" style={{ color: COLOR }} />
                      <p className="absolute bottom-2 text-[9px] text-zinc-500">{item.title}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div className="flex lg:hidden justify-center gap-1.5">
              {galleryItems.map((_, i) => (
                <button key={i} onClick={() => setCarouselIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === carouselIndex ? 'w-6' : 'w-1.5 bg-white/20'}`}
                  style={{ background: i === carouselIndex ? COLOR : undefined }} />
              ))}
            </div>
          </div>

          {/* Info do item atual */}
          <div className="mt-6 text-center">
            <p className="text-sm md:text-base font-bold text-white">{galleryItems[carouselIndex].title}</p>
            <p className="text-xs md:text-sm text-zinc-400 mt-1">{galleryItems[carouselIndex].desc}</p>
            <p className="text-xs mt-1.5" style={{ color: CYAN }}>✨ {galleryItems[carouselIndex].benefit}</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <CTA large>Quero Acesso a Tudo Isso <ArrowRight size={18} /></CTA>
        </div>
      </section>

      {/* ====== 7. FINANÇAS PESSOAIS + EMPRESARIAIS (compacto) ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Pessoais */}
            <ScrollReveal>
              <GlassCard className="h-full">
                <Badge color="#22C55E">👤 Pessoal</Badge>
                <h3 className="text-xl font-bold text-white mt-3 mb-4">Para sua vida pessoal</h3>
                <div className="grid grid-cols-1 gap-2">
                  {['Controle de receitas e despesas', 'Metas financeiras com progresso', 'Gestão de cartões de crédito', 'Planejamento orçamentário mensal', 'Simulador de investimentos', 'Gráficos e relatórios em PDF'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0" /><span className="text-zinc-300">{f}</span></div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>

            {/* Empresariais */}
            <ScrollReveal>
              <GlassCard className="h-full" style={{ borderColor: CYAN + '30' }}>
                <Badge color={CYAN}>🏢 Empresarial</Badge>
                <h3 className="text-xl font-bold text-white mt-3 mb-4">Para o seu negócio</h3>
                <div className="grid grid-cols-1 gap-2">
                  {['Fluxo de caixa em tempo real', 'Contas a pagar e receber', 'DRE simplificado automático', 'Margem de lucro por período', 'Controle de custos operacionais', 'Relatórios gerenciais exportáveis'].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0" /><span className="text-zinc-300">{f}</span></div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <CTAInSection text="Quero Ver Meu Lucro Real" />

      {/* ====== 8. PARA QUEM É ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle sub="Feito para todos que querem controle financeiro de verdade">Para quem é o {APP}?</SectionTitle>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '💰', t: 'Quem quer economizar dinheiro' },
              { icon: '📊', t: 'Quem vive sem controle financeiro' },
              { icon: '🏪', t: 'MEIs e pequenos empreendedores' },
              { icon: '💼', t: 'Autônomos e freelancers' },
              { icon: '🏢', t: 'Pequenas empresas' },
              { icon: '👨‍👩‍👧', t: 'Famílias' },
              { icon: '👩‍⚕️', t: 'Profissionais liberais' },
              { icon: '🎓', t: 'Estudantes e estagiários' },
            ].map((p, i) => (
              <ScrollReveal key={i}>
                <GlassCard className="flex items-center gap-3 p-4">
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-xs md:text-sm text-zinc-300">{p.t}</span>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 9. 30 DIAS ====== */}
      <section className="px-4 py-16">
        <SectionTitle sub="Resultados reais que você pode alcançar">O que você conquista em 30 dias?</SectionTitle>
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: '🔍', t: 'Descobrir para onde seu dinheiro vai' },
              { icon: '📋', t: 'Organizar todas as suas contas' },
              { icon: '💳', t: 'Controlar seus cartões de crédito' },
              { icon: '🎯', t: 'Criar e acompanhar metas financeiras' },
              { icon: '📈', t: 'Melhorar o fluxo de caixa' },
              { icon: '🗑️', t: 'Reduzir desperdícios financeiros' },
            ].map((item, i) => (
              <ScrollReveal key={i}>
                <GlassCard className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: COLOR + '20' }}>
                    <span className="text-lg">{item.icon}</span>
                  </div>
                  <p className="text-sm text-zinc-200">{item.t}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <CTA>Começar Meus 30 Dias <ArrowRight size={16} /></CTA>
          </div>
        </div>
      </section>

      <CTAInSection text="Garantir Minha Licença Agora" />

      {/* ====== 10. VALOR PERCEBIDO ====== */}
      <section ref={priceRef} className="px-4 py-16 border-t border-white/5">
        <SectionTitle sub="Se você fosse comprar cada funcionalidade separadamente...">Quanto custaria tudo separado?</SectionTitle>
        <div className="mx-auto max-w-2xl">
          <ScrollReveal>
            <GlassCard className="!bg-white/[.06]">
              <div className="space-y-2">
                {individualPrices.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{item.name}</span>
                    <span className="text-zinc-300 font-medium">R$ {item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Valor Total</span>
                  <span className="text-lg font-black text-red-400 price-strikethrough">R$ 341,20</span>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Animação de redução de preço */}
          <div className="mt-8 text-center">
            {priceStep >= 1 && (
              <div className="animate-price space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <ArrowDown size={20} style={{ color: COLOR }} />
                  <span className="text-xl font-black text-zinc-500 price-strikethrough">R$ 197,90</span>
                </div>
              </div>
            )}
            {priceStep >= 2 && (
              <div className="animate-price mt-2">
                <div className="flex items-center justify-center gap-3">
                  <ArrowDown size={20} style={{ color: COLOR }} />
                  <span className="text-xl font-black text-zinc-500 price-strikethrough">R$ {PRICE_NORMAL}</span>
                </div>
              </div>
            )}
            {priceStep >= 3 && (
              <div className="animate-price mt-6">
                <div className="inline-flex flex-col items-center glass-strong rounded-3xl p-6 md:p-8" style={{ borderColor: COLOR + '50' }}>
                  <p className="text-sm text-zinc-400 mb-1">HOJE você leva tudo por apenas</p>
                  <p className="text-5xl md:text-7xl font-black animate-pulse-slow" style={{ background: `linear-gradient(135deg, ${COLOR}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    R$ {PRICE_PROMO}
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">pagamento único · acesso vitalício</p>
                  <p className="mt-3 text-xs text-emerald-400 font-semibold">Você economiza R$ 273,30!</p>
                </div>
              </div>
            )}
            {priceStep >= 3 && (
              <div className="mt-6 animate-fade-in">
                <CTA large full>QUERO ECONOMIZAR R$ 273,30 AGORA <ArrowRight size={20} /></CTA>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====== 11. COMPARATIVO ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle>Antes e depois do {APP}</SectionTitle>
        <div className="mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="glass rounded-3xl overflow-hidden grid grid-cols-2">
              <div className="p-5 md:p-8 border-r border-white/5">
                <p className="text-sm font-bold text-red-400 mb-4">😰 Sem {APP}</p>
                {['Dinheiro sem controle', 'Planilhas confusas', 'Zero visão do lucro', 'Estresse financeiro', 'Decisões no escuro'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"><X size={14} className="text-red-500 shrink-0" /><span className="text-xs text-zinc-400">{t}</span></div>
                ))}
              </div>
              <div className="p-5 md:p-8" style={{ background: COLOR + '08' }}>
                <p className="text-sm font-bold text-emerald-400 mb-4">😎 Com {APP}</p>
                {['Controle total em tempo real', 'App intuitivo e rápido', 'Lucro calculado automaticamente', 'Paz e tranquilidade', 'Decisões baseadas em dados'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"><Check size={14} className="text-emerald-500 shrink-0" /><span className="text-xs text-zinc-300">{t}</span></div>
                ))}
              </div>
            </div>
          </ScrollReveal>
          <div className="text-center mt-6">
            <CTA>Quero o lado direito da tabela <ArrowRight size={16} /></CTA>
          </div>
        </div>
      </section>

      {/* ====== 12. BENEFÍCIOS ====== */}
      <section className="px-4 py-16">
        <SectionTitle sub="Por que o {APP} é diferente de tudo que você já viu">Benefícios Exclusivos</SectionTitle>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: 'Mais organização', d: 'Tudo categorizado e acessível em segundos' },
              { t: 'Menos estresse', d: 'Saiba exatamente sua situação a qualquer momento' },
              { t: 'Controle completo', d: 'Pessoal e empresarial no mesmo app' },
              { t: 'Economia de tempo', d: 'Chega de planilhas complexas e confusas' },
              { t: 'Decisões inteligentes', d: 'Relatórios e gráficos automáticos' },
              { t: 'Crescimento saudável', d: 'Acompanhe metas e investimentos de perto' },
            ].map((b, i) => (
              <ScrollReveal key={i}>
                <GlassCard>
                  <Check size={16} className="text-emerald-400 mb-2" />
                  <h3 className="text-sm font-bold text-white mb-1">{b.t}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{b.d}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTAInSection text="Quero Todos Esses Benefícios" />

      {/* ====== 13. DEPOIMENTOS ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle sub="⭐ 4.9 estrelas em mais de 500 avaliações">Quem usa recomenda</SectionTitle>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((d, i) => (
              <ScrollReveal key={i}>
                <GlassCard className="!bg-white/[.06] flex flex-col h-full">
                  <div className="flex gap-0.5 mb-3">{Array(5).fill(0).map((_, j) => <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}</div>
                  <p className="text-sm text-zinc-300 leading-relaxed italic flex-1">{d.text}</p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs py-1 px-2 rounded-lg inline-block" style={{ background: COLOR + '15', color: COLOR }}>{d.result}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <img src={`https://i.pravatar.cc/80?img=${d.img}`} alt={d.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" />
                    <div>
                      <p className="text-xs font-semibold text-white">{d.name}</p>
                      <p className="text-[10px] text-zinc-500">{d.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-8">
            <CTA>Quero Ser o Próximo Caso de Sucesso <ArrowRight size={16} /></CTA>
          </div>
        </div>
      </section>

      {/* ====== 14. GARANTIA ====== */}
      <section className="px-4 py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-xl text-center">
            <GlassCard className="!bg-white/[.06]" style={{ borderColor: '#22C55E30' }}>
              <Shield size={48} className="mx-auto mb-4 text-emerald-400" />
              <h2 className="text-xl md:text-2xl font-bold text-white">7 Dias de Garantia Incondicional</h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Teste o {APP} sem risco nenhum. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro em até 7 dias. Sem perguntas, sem letras miúdas, sem burocracia.
              </p>
              <p className="mt-4 text-sm font-semibold text-emerald-400">✅ Risco zero · Satisfação garantida</p>
            </GlassCard>
          </div>
        </ScrollReveal>
      </section>

      {/* ====== 15. FAQ ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionTitle>Perguntas Frequentes</SectionTitle>
        <div className="mx-auto max-w-2xl">
          <div className="space-y-2">
            {[
              { q: 'O pagamento é único?', a: 'Sim! Você paga apenas uma vez e tem acesso vitalício ao ECONOMIZZEI, incluindo todas as atualizações futuras gratuitas.' },
              { q: 'Funciona para MEI e empresas?', a: 'Sim. O ECONOMIZZEI tem módulo empresarial completo: fluxo de caixa, DRE simplificado, contas a pagar/receber, margem de lucro e relatórios gerenciais.' },
              { q: 'Funciona para pessoa física?', a: 'Sim. Controle total de receitas, despesas, metas, cartões de crédito, investimentos, planejamento mensal e relatórios.' },
              { q: 'Como recebo o acesso?', a: 'Após a confirmação do pagamento, você recebe um e-mail com as instruções para criar sua senha e acessar imediatamente.' },
              { q: 'Posso usar no celular?', a: 'Sim! O ECONOMIZZEI é 100% responsivo e funciona perfeitamente em celular, tablet e computador.' },
              { q: 'Tem suporte?', a: 'Sim. Suporte via chat dentro da plataforma com resposta em até 48 horas úteis.' },
            ].map((faq, i) => (
              <GlassCard key={i} className="!p-0 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-zinc-500 shrink-0" /> : <ChevronDown size={16} className="text-zinc-500 shrink-0" />}
                </button>
                {openFaq === i && <div className="px-4 pb-4 border-t border-white/5"><p className="text-sm text-zinc-400 leading-relaxed pt-3">{faq.a}</p></div>}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 16. OFERTA FINAL ====== */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <div className="glass-strong rounded-3xl p-6 md:p-10" style={{ borderColor: COLOR + '50' }}>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-4"><Zap size={12} /> Oferta Especial de Lançamento</div>

              <h2 className="text-2xl md:text-4xl font-black text-white">Tudo que você precisa para dominar suas finanças</h2>

              {/* Checklist */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {['Licença Vitalícia', 'Acesso Imediato', 'Finanças Pessoais', 'Finanças Empresariais', 'Controle de Cartões', 'Metas Financeiras', 'Controle de Investimentos', 'Dashboard Completo', 'Garantia de 7 Dias', 'Suporte Prioritário'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0" /><span className="text-zinc-300">{f}</span></div>
                ))}
              </div>

              <div className="mt-8">
                <p className="text-xs text-zinc-500">De <span className="price-strikethrough">R$ {PRICE_NORMAL}</span></p>
                <p className="text-5xl md:text-7xl font-black mt-1" style={{ background: `linear-gradient(135deg, ${COLOR}, ${CYAN})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  R$ {PRICE_PROMO}
                </p>
                <p className="text-sm text-zinc-400 mt-1">pagamento único · acesso vitalício · 7 dias de garantia</p>
                <p className="text-xs text-zinc-500 mt-1">ou 12x de R$ 6,79 no cartão</p>
              </div>

              <div className="mt-6">
                <CTA large full>QUERO MINHA LICENÇA VITALÍCIA AGORA <ArrowRight size={22} /></CTA>
              </div>

              <div className="flex items-center justify-center gap-3 mt-4 text-[10px] md:text-xs text-zinc-500 flex-wrap">
                <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" /> Garantia 7 dias</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" /> Vitalício</span>
                <span className="flex items-center gap-1"><Smartphone size={12} /> Multi-dispositivo</span>
                <span className="flex items-center gap-1"><Zap size={12} style={{ color: COLOR }} /> Acesso imediato</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <div id="stats-section" className="grid grid-cols-2 gap-4 mt-8">
            <GlassCard className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white">{nums.users.toLocaleString()}+</p>
              <p className="text-xs text-zinc-500 mt-1">Usuários ativos</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white">R$ {nums.saved.toLocaleString()}</p>
              <p className="text-xs text-zinc-500 mt-1">Economizados</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ====== 17. FOOTER ====== */}
      <footer className="border-t border-white/8 py-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs md:text-sm">
            <div>
              <p className="font-bold text-white mb-3">{APP}</p>
              <p className="text-zinc-500">Controle financeiro inteligente para pessoas e empresas.</p>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Produto</p>
              <div className="space-y-1.5 text-zinc-500">
                <p>Funcionalidades</p>
                <p>Preço</p>
                <p>Garantia</p>
                <p>FAQ</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Suporte</p>
              <div className="space-y-1.5 text-zinc-500">
                <p>Central de Ajuda</p>
                <p>Contato</p>
                <p>Chat na Plataforma</p>
              </div>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Legal</p>
              <div className="space-y-1.5 text-zinc-500">
                <p>Política de Privacidade</p>
                <p>Termos de Uso</p>
                <p>7 Dias de Garantia</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/8 text-center text-[10px] md:text-xs text-zinc-600">
            <p>{APP} © {new Date().getFullYear()} · Todos os direitos reservados</p>
            <p className="mt-1">Tecnologia Cakto · Pagamento 100% seguro · Licença vitalícia</p>
          </div>
        </div>
      </footer>

      {/* ====== FLOATING CTA MOBILE ====== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2.5" style={{ background: 'rgba(10,6,20,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={() => track('MobileFloating')}
          className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white active:scale-[.98]"
          style={{ background: `linear-gradient(135deg, ${COLOR}, #7C3AED)` }}>
          <Zap size={16} /> QUERO MINHA LICENÇA · R$ {PRICE_PROMO}
        </a>
      </div>
    </div>
  )
}

function CTAInSection({ text }: { text: string }) {
  return (
    <div className="px-4 pb-12 md:pb-16 -mt-4">
      <div className="mx-auto max-w-md text-center">
        <ScrollReveal>
          <CTA>{text} <ArrowRight size={16} /></CTA>
        </ScrollReveal>
      </div>
    </div>
  )
}

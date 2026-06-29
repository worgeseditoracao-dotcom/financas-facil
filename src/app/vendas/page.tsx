'use client'

import { useState, useEffect, useRef } from 'react'
import { CAKTO_CHECKOUT_URL } from '@/lib/config'
import {
  Check, Shield, Zap, Star, ChevronDown, ChevronUp, ArrowRight, ArrowDown,
  TrendingUp, PiggyBank, BarChart3, Target, CreditCard, FileText,
  Smartphone, Building2, DollarSign, Clock, Wallet, Users, X, Play, Send,
  Briefcase, Home, GraduationCap, Heart
} from 'lucide-react'

const APP = 'ECONOMIZZEI'
const PRICE_PROMO = '67,90'
const PRICE_NORMAL = '87,90'
const PRICE_NEXT_LOT = '97,90'
const COLOR = '#8B5CF6'
const CYAN = '#06B6D4'
const CHECKOUT = CAKTO_CHECKOUT_URL || '#'
const SOLD = 87
const TOTAL = 100
const LEFT = TOTAL - SOLD

const modulos = [
  { name: 'Controle Financeiro Pessoal', price: '47,90' },
  { name: 'Controle de Cartões', price: '37,90' },
  { name: 'Metas Financeiras', price: '29,90' },
  { name: 'Planejamento Orçamentário', price: '39,90' },
  { name: 'Simulador de Investimentos', price: '47,90' },
  { name: 'Fluxo de Caixa Empresarial', price: '67,90' },
  { name: 'Contas a Pagar e Receber', price: '29,90' },
  { name: 'Dashboard Inteligente', price: '39,90' },
]
const TOTAL_MODULOS = modulos.reduce((a, m) => a + parseFloat(m.price), 0)

function track(n: string) { try { (window as any).fbq?.('trackCustom', n) } catch {} }

function Btn({ children, big, full }: { children: React.ReactNode; big?: boolean; full?: boolean }) {
  return <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={() => track('CTA')}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[.97] hover:shadow-2xl ${big ? 'px-10 py-5 text-lg' : 'px-6 py-3.5 text-sm'} ${full ? 'w-full' : ''}`}
    style={{ background: `linear-gradient(135deg, ${COLOR}, #7C3AED)` }}>{children}</a>
}

function Badge({ children, clr = CYAN }: { children: React.ReactNode; clr?: string }) {
  return <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] md:text-xs font-medium border" style={{ borderColor: clr + '40', background: clr + '15', color: clr }}>{children}</div>
}

function SectionHead({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return <div className="text-center mb-8 md:mb-12">
    <h2 className="text-2xl md:text-4xl font-extrabold text-white">{children}</h2>
    {sub && <p className="mt-2 md:mt-3 text-sm md:text-base text-zinc-400 max-w-xl mx-auto">{sub}</p>}
  </div>
}

function Card({ children, cls = '', stl = {}, onClick }: any) {
  return <div className={`rounded-2xl md:rounded-3xl p-5 md:p-6 border border-white/10 ${cls}`} style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(10px)', ...stl }} onClick={onClick}>{children}</div>
}

function Reveal({ children, cls = '' }: { children: React.ReactNode; cls?: string }) {
  const r = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect() } }, { threshold: 0.1 })
    if (r.current) o.observe(r.current)
    return () => o.disconnect()
  }, [])
  return <div ref={r} className={`transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${cls}`}>{children}</div>
}

function CTABlock({ txt }: { txt: string }) {
  return <div className="px-4 pb-12 md:pb-16 -mt-4"><div className="mx-auto max-w-md text-center"><Reveal><Btn>{txt} <ArrowRight size={16} /></Btn></Reveal></div></div>
}

export default function VendasPage() {
  const [faq, setFaq] = useState<number | null>(null)
  const [carIdx, setCarIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [pStep, setPStep] = useState(0)
  const [nums, setNums] = useState({ u: 0, s: 0 })
  const pr = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { [0,1,2,3].forEach((s,i) => setTimeout(() => setPStep(s), i*500)); o.disconnect() }
    }, { threshold: 0.3 })
    if (pr.current) o.observe(pr.current)
    return () => o.disconnect()
  }, [])

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let f=0; const T=50; const i=setInterval(()=>{f++;setNums({u:Math.floor((f/T)*3200),s:Math.floor((f/T)*210000)});if(f>=T)clearInterval(i)},25)
        o.disconnect()
      }
    })
    const el = document.getElementById('stats')
    if (el) o.observe(el)
  }, [])

  const slides = [
    { t:'Dashboard', d:'Visão completa em tempo real', b:'Tome decisões baseadas em dados', img:'/prints/dashboard.png' },
    { t:'Contas', d:'Contas a pagar e receber', b:'Nunca mais esqueça um vencimento', img:'/prints/contas.png' },
    { t:'Empresa', d:'Fluxo de caixa, DRE e lucro', b:'Saiba exatamente quanto você lucra', img:'/prints/empresa.png' },
    { t:'Insights', d:'Análises inteligentes', b:'Receba dicas personalizadas', img:'/prints/insights.png' },
    { t:'Relatórios', d:'Gráficos e exportações', b:'Visualize seus dados com clareza', img:'/prints/relatorios.png' },
    { t:'Financeiro Pessoal', d:'Receitas e despesas', b:'Controle total do seu dinheiro', img:'/prints/pessoal.png' },
  ]

  const depoimentos = [
    { n:'Mariana Silva', r:'Empresária', img:'44', txt:'"Eu misturava tudo, não sabia o lucro da loja. Com o ECONOMIZZEI vejo separadinho: pessoal de um lado, empresa do outro. Minha vida financeira mudou."', res:'Aumentou o lucro em 40%' },
    { n:'Rafael Oliveira', r:'MEI - Lanchonete', img:'12', txt:'"Paguei 67 reais e em 1 mês economizei mais de 300 reais só organizando meus gastos. Melhor investimento do ano, sem dúvida."', res:'Economizou R$ 300+ no 1º mês' },
    { n:'Camila Santos', r:'Manicure Autônoma', img:'5', txt:'"Não tinha controle nenhum. Agora sei exatamente quanto entra, sai e sobra. Pela primeira vez tô conseguindo guardar dinheiro de verdade."', res:'Primeira reserva financeira' },
    { n:'Fernanda Lima', r:'Dentista', img:'23', txt:'"Atendo dezenas de pacientes e nunca sabia meu faturamento real. Hoje sei ticket médio, custos e lucro líquido. Clareza total."', res:'Clareza total do consultório' },
    { n:'Thiago Martins', r:'Loja de Camisetas', img:'60', txt:'"Testei 4 apps antes. O ECONOMIZZEI foi o único que atendeu lado pessoal e minha loja. Interface linda, super intuitivo, recomendo sempre."', res:'Unificou pessoal + empresa' },
    { n:'Amanda Rocha', r:'Dona de Casa', img:'48', txt:'"Eu e meu marido brigávamos por dinheiro. Começamos a usar juntos, criamos metas de casal. Nossa relação melhorou demais, sério!"', res:'Paz financeira no casamento' },
  ]

  return (
    <div className="w-full min-h-screen font-sans scroll-smooth overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #0A0614 0%, #100B20 50%, #0A0614 100%)', color: '#fff' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100%{ opacity:1; } 50%{ opacity:.5; } }
        @keyframes bounceIn { 0%{ transform:scale(0.3);opacity:0; } 50%{ transform:scale(1.05); } 70%{ transform:scale(0.95); } 100%{ transform:scale(1);opacity:1 } }
        @keyframes float { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-8px); } }
        @keyframes shimmer { 0%{ background-position:-200% center; } 100%{ background-position:200% center; } }
        @keyframes priceDrop { 0%{ transform:scale(0.8);opacity:0; } 100%{ transform:scale(1);opacity:1; } }
        .afade { animation:fadeIn .6s ease-out forwards }
        .afadeUp { animation:fadeUp .8s ease-out forwards }
        .apulse { animation:pulse 2s ease-in-out infinite }
        .abounce { animation:bounceIn .7s ease-out forwards }
        .afloat { animation:float 4s ease-in-out infinite }
        .aprice { animation:priceDrop .5s ease-out forwards }
        .shimmer { background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent); background-size:200% 100%; animation:shimmer 2s infinite }
        .glass { background:rgba(255,255,255,.04); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.08) }
        .glassS { background:rgba(255,255,255,.08); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,.12) }
        .glow { box-shadow:0 0 120px rgba(139,92,246,.2),0 0 40px rgba(6,182,212,.08) }
        .gradtxt { background:linear-gradient(135deg,${COLOR},${CYAN}); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
        .line-through { text-decoration:line-through }
      `}</style>

      {/* TOP BAR */}
      <div className="sticky top-0 z-50 border-b border-white/8" style={{ background:'rgba(10,6,20,.96)', backdropFilter:'blur(16px)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-3 md:px-4 py-2">
          <div className="flex-1">
            <p className="text-[11px] md:text-xs text-zinc-400"><span className="text-white font-bold">{SOLD} licenças ativadas</span><span className="hidden sm:inline"> · Restam {LEFT} neste lote</span></p>
            <div className="h-1 bg-white/5 rounded-full mt-1 hidden sm:block"><div className="h-full rounded-full" style={{width:`${SOLD}%`,background:`linear-gradient(90deg,${COLOR},${CYAN})`}} /></div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3 ml-3">
            <a href="/login" className="text-[11px] md:text-xs font-medium text-zinc-300 hover:text-white border border-zinc-600 hover:border-zinc-400 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap">Já comprei</a>
            <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" className="rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-bold text-white hover:scale-105 transition-all" style={{background:`linear-gradient(135deg,${COLOR},#7C3AED)`}}>R$ {PRICE_PROMO}</a>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pt-10 pb-20 md:pt-20 md:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-15 blur-[100px]" style={{background:COLOR}} />
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full opacity-10 blur-[80px]" style={{background:CYAN}} />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="afade"><Badge clr={COLOR}><Zap size={12} /> Acesso Vitalício</Badge><span className="mx-2" /><Badge><Shield size={12} /> 7 Dias de Garantia</Badge><span className="mx-2" /><Badge clr="#A78BFA"><Smartphone size={12} /> Celular e Computador</Badge></div>
          <h1 className="mt-6 text-[2rem] md:text-5xl lg:text-[3.5rem] font-black leading-[1.1] afade">
            Um sistema completo para{' '}<span className="gradtxt">organizar sua vida financeira pessoal e seu negócio</span> em um único lugar
          </h1>
          <p className="mt-4 md:mt-6 text-sm md:text-lg text-zinc-400 max-w-xl mx-auto afade">Chega de planilhas, apps separados e confusão. Controle receitas, cartões, metas, investimentos e fluxo de caixa da sua empresa com um sistema profissional.</p>
          <p className="mt-3 text-xs text-cyan-400/70 afade">☁️ Sincronização em nuvem — comece no celular, continue no computador. Seus dados sempre atualizados.</p>
          <div className="mt-8 afade"><Btn big>QUERO MINHA LICENÇA AGORA <ArrowRight size={20} /></Btn>
            <p className="mt-3 text-xs md:text-sm text-zinc-500">De <span className="line-through text-zinc-600">R$ {PRICE_NORMAL}</span> por <span className="text-white font-bold">R$ {PRICE_PROMO}</span> · Acesso vitalício</p>
          </div>
          <div className="mt-12 mx-auto max-w-[280px] md:max-w-sm afade">
            <div className="glow rounded-[2rem] overflow-hidden border border-white/10">
              <div className="aspect-[9/16] bg-[#0A0614] flex flex-col items-center justify-center p-4 relative">
                <div className="w-full space-y-2.5"><div className="h-1.5 rounded-full" style={{background:COLOR,width:'65%'}} /><div className="h-1.5 rounded-full bg-white/10 w-full" /><div className="h-1.5 rounded-full bg-white/10 w-4/5" /></div>
                <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                  <div className="rounded-2xl p-3" style={{background:COLOR+'15'}}><div className="h-1 rounded-full bg-white/20 w-3/4 mb-2" /><span className="text-lg font-bold" style={{color:COLOR}}>+2,4k</span></div>
                  <div className="rounded-2xl p-3" style={{background:CYAN+'15'}}><div className="h-1 rounded-full bg-white/20 w-3/4 mb-2" /><span className="text-lg font-bold" style={{color:CYAN}}>-1,1k</span></div>
                </div>
                <div className="mt-3 w-full h-20 rounded-2xl bg-white/5 flex items-center justify-center"><BarChart3 size={24} className="opacity-30" style={{color:COLOR}} /></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0614] h-16" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JÁ É CLIENTE? */}
      <section className="px-4 pb-12 -mt-8">
        <div className="mx-auto max-w-lg text-center">
          <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-sm font-bold text-white">Já comprou?</p>
              <p className="text-xs text-zinc-400">Acesse o app com seu email e senha</p>
            </div>
            <a href="/login" className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-105">
              Fazer Login <ArrowRight size={14} />
            </a>
            <a href="/primeiro-acesso" className="text-xs text-zinc-500 hover:text-cyan-400 transition-colors">
              Criar senha (1º acesso)
            </a>
          </div>
        </div>
      </section>

      {/* VÍDEO */}
      <section className="px-0 md:px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="md:glass md:rounded-3xl overflow-hidden">
            <div className="aspect-video bg-black">
              <iframe
                src="https://player.vimeo.com/video/1205620629?h=9b7a3c2d1e&autoplay=0&title=0&byline=0&portrait=0"
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="ECONOMIZZEI"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 1. IDENTIFICAÇÃO IMEDIATA */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead sub="Independente do seu perfil, ele foi feito sob medida para você">Este aplicativo foi criado para você que...</SectionHead>
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <Card cls="h-full" stl={{borderColor:COLOR+'30'}}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:COLOR+'20'}}><Home size={24} style={{color:COLOR}} /></div>
                  <div><p className="text-lg font-bold text-white">👤 PESSOAL</p><p className="text-xs text-zinc-500">Para sua vida financeira</p></div>
                </div>
                <div className="space-y-3">
                  {['Controla suas finanças pessoais','É profissional liberal ou autônomo','Divide as contas com a família','Quer parar de viver no limite','Deseja finalmente economizar dinheiro','Não sabe para onde o dinheiro vai'].map((t,i)=><div key={i} className="flex items-start gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0 mt-0.5" /><span className="text-zinc-300">{t}</span></div>)}
                </div>
              </Card>
            </Reveal>
            <Reveal>
              <Card cls="h-full" stl={{borderColor:CYAN+'30'}}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:CYAN+'20'}}><Briefcase size={24} style={{color:CYAN}} /></div>
                  <div><p className="text-lg font-bold text-white">🏢 NEGÓCIOS</p><p className="text-xs text-zinc-500">Para o seu empreendimento</p></div>
                </div>
                <div className="space-y-3">
                  {['Tem um MEI ou pequena empresa','Trabalha como autônomo','Mistura dinheiro pessoal e da empresa','Não sabe o lucro real do negócio','Quer organizar fluxo de caixa','Precisa de relatórios gerenciais'].map((t,i)=><div key={i} className="flex items-start gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0 mt-0.5" /><span className="text-zinc-300">{t}</span></div>)}
                </div>
              </Card>
            </Reveal>
          </div>
          <p className="text-center mt-6 text-sm text-zinc-400">✅ Marque mentalmente os itens que se identificou. O ECONOMIZZEI resolve todos eles.</p>
        </div>
      </section>

      <CTABlock txt="Quero Resolver Esses Problemas Agora" />

      {/* 2. DOIS SISTEMAS EM UM */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead sub="Você não precisa de dois apps. Precisa do ECONOMIZZEI">Dois sistemas completos em um só lugar</SectionHead>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3 items-center">
            <Reveal>
              <Card cls="h-full" stl={{borderColor:COLOR+'30'}}>
                <p className="text-xs font-bold mb-4" style={{color:COLOR}}>👤 FINANÇAS PESSOAIS</p>
                <div className="space-y-2.5">
                  {[['Receitas e Despesas','Registre tudo em segundos'],['Cartões de Crédito','Controle limite e faturas'],['Metas Financeiras','Defina e acompanhe objetivos'],['Investimentos','Simule rendimentos'],['Planejamento Mensal','Orçamento inteligente']].map(([t,d],i)=><div key={i} className="flex items-start gap-2"><Check size={12} className="text-emerald-400 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-white">{t}</p><p className="text-[11px] text-zinc-500">{d}</p></div></div>)}
                </div>
              </Card>
            </Reveal>

            <Reveal cls="text-center">
              <div className="glassS rounded-3xl p-6 md:p-8" style={{borderColor:COLOR+'50'}}>
                <p className="text-xs text-zinc-400 mb-1">Você recebe os</p>
                <p className="text-lg md:text-xl font-black text-white">dois sistemas</p>
                <div className="w-12 h-0.5 mx-auto my-3 rounded-full" style={{background:COLOR}} />
                <p className="text-xs text-zinc-400">por apenas</p>
                <p className="text-3xl md:text-4xl font-black mt-1 gradtxt">R$ {PRICE_PROMO}</p>
                <p className="text-[10px] text-zinc-500 mt-1">pagamento único · vitalício</p>
              </div>
            </Reveal>

            <Reveal>
              <Card cls="h-full" stl={{borderColor:CYAN+'30'}}>
                <p className="text-xs font-bold mb-4" style={{color:CYAN}}>🏢 FINANÇAS EMPRESARIAIS</p>
                <div className="space-y-2.5">
                  {[['Fluxo de Caixa','Entradas e saídas em tempo real'],['DRE Simplificado','Demonstrativo automático'],['Custos Operacionais','Controle cada gasto'],['Contas a Pagar','Nunca esqueça um vencimento'],['Relatórios Gerenciais','Exporte PDF e Excel']].map(([t,d],i)=><div key={i} className="flex items-start gap-2"><Check size={12} className="text-emerald-400 shrink-0 mt-0.5" /><div><p className="text-sm font-medium text-white">{t}</p><p className="text-[11px] text-zinc-500">{d}</p></div></div>)}
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABlock txt="Quero os Dois Sistemas por R$ 67,90" />

      {/* 3. BENEFÍCIOS POR PERFIL */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead>Veja como o {APP} ajuda cada tipo de pessoa</SectionHead>
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon:'🏪', perfil:'MEI', beneficio:'Saiba seu lucro real. Separe as contas da empresa das contas pessoais e nunca mais misture tudo.' },
              { icon:'💼', perfil:'Autônomo', beneficio:'Controle entradas e saídas de cada cliente. Saiba exatamente quanto ganhou no mês.' },
              { icon:'🏢', perfil:'Pequena Empresa', beneficio:'Organize o fluxo de caixa, controle custos e gere relatórios em segundos.' },
              { icon:'👨‍👩‍👧', perfil:'Família', beneficio:'Controle o orçamento doméstico, planeje compras e crie metas financeiras em família.' },
              { icon:'👩‍⚕️', perfil:'Profissional Liberal', beneficio:'Separe finanças pessoais das profissionais. Controle agenda e recebimentos.' },
              { icon:'🎓', perfil:'Estudante', beneficio:'Desenvolva educação financeira desde cedo. Controle mesada, gastos e comece a investir.' },
            ].map((p,i) => (
              <Reveal key={i}><Card cls="flex flex-col items-start gap-3 text-left h-full">
                <div className="flex items-center gap-3"><span className="text-2xl">{p.icon}</span><p className="text-sm font-bold text-white">{p.perfil}</p></div>
                <p className="text-xs text-zinc-400 leading-relaxed">→ {p.beneficio}</p>
              </Card></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. GALERIA */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead sub="6 telas. Infinitas possibilidades de controle financeiro">Conheça o sistema por dentro</SectionHead>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* GALERIA MOBILE */}
          <div className="flex lg:hidden flex-col items-center gap-4 w-full">
            <div className="w-[95%] cursor-pointer" onClick={() => setLightbox(true)}>
              <div className="glass rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-[16/10] bg-[#0A0614] relative">
                  <img src={slides[carIdx].img} alt={slides[carIdx].t} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={()=>setCarIdx(Math.max(0,carIdx-1))} className="p-4 rounded-xl glass text-white active:scale-95"><ChevronDown size={22} className="rotate-90" /></button>
              <div className="flex gap-2">{slides.map((_,i)=><button key={i} onClick={()=>setCarIdx(i)} className={`h-3 rounded-full transition-all ${i===carIdx?'w-10':'w-3 bg-white/30'}`} style={{background:i===carIdx?COLOR:undefined}} />)}</div>
              <button onClick={()=>setCarIdx(Math.min(slides.length-1,carIdx+1))} className="p-4 rounded-xl glass text-white active:scale-95"><ChevronDown size={22} className="-rotate-90" /></button>
            </div>
            <p className="text-xs text-zinc-500">Toque na imagem para ampliar</p>
          </div>

          {/* GALERIA DESKTOP */}
          <div className="hidden lg:grid grid-cols-3 gap-5 w-full">
            {slides.map((s,i)=><Reveal key={i}><div className={`glass rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-[1.03] shadow-2xl ${i===carIdx?'ring-2':''}`} style={i===carIdx?{ringColor:COLOR}:{}} onClick={()=>{setCarIdx(i);setLightbox(true)}}><div className="aspect-[16/10] bg-[#0A0614] relative"><img src={s.img} alt={s.t} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} /><p className="absolute bottom-3 left-3 right-3 text-center text-xs text-white bg-black/70 py-2 rounded-xl">{s.t}</p></div></div></Reveal>)}
            </div>
            <div className="flex lg:hidden justify-center gap-1.5">{slides.map((_,i)=><button key={i} onClick={()=>setCarIdx(i)} className={`h-1.5 rounded-full transition-all ${i===carIdx?'w-6':'w-1.5 bg-white/20'}`} style={{background:i===carIdx?COLOR:undefined}} />)}</div>
          </div>
          {/* LIGHTBOX */}
        {lightbox && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl z-10">&times;</button>
            <button onClick={(e) => { e.stopPropagation(); setCarIdx(Math.max(0, carIdx - 1)) }} className="absolute left-2 md:left-8 text-white/80 hover:text-white p-3 z-10">
              <ChevronDown size={32} className="rotate-90" />
            </button>
            <img src={slides[carIdx].img} alt={slides[carIdx].t} className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); setCarIdx(Math.min(slides.length - 1, carIdx + 1)) }} className="absolute right-2 md:right-8 text-white/80 hover:text-white p-3 z-10">
              <ChevronDown size={32} className="-rotate-90" />
            </button>
            <div className="absolute bottom-6 flex gap-2">
              {slides.map((_, i) => <button key={i} onClick={(e) => { e.stopPropagation(); setCarIdx(i) }} className={`h-3 rounded-full transition-all ${i === carIdx ? 'w-10' : 'w-3 bg-white/40'}`} style={{ background: i === carIdx ? COLOR : undefined }} />)}
            </div>
          </div>
        )}

        <div className="mt-6 text-center"><p className="text-sm md:text-base font-bold text-white">{slides[carIdx].t}</p><p className="text-xs md:text-sm text-zinc-400 mt-1">{slides[carIdx].d}</p><p className="text-xs mt-1.5" style={{color:CYAN}}>✨ {slides[carIdx].b}</p></div>
        </div>
      </section>

      <CTABlock txt="Quero Acesso Completo ao Sistema" />

      {/* 5. ESCASSEZ */}
      <section className="px-4 py-10 md:py-16 border-t border-white/5">
        <Reveal><div className="mx-auto max-w-2xl text-center"><Card cls="!bg-white/[.06]">
          <div className="flex items-center justify-center gap-2 mb-4">{[...Array(5)].map((_,i)=><div key={i} className="w-2 h-2 rounded-full abounce" style={{background:COLOR,animationDelay:`${i*.15}s`}} />)}</div>
          <p className="text-lg md:text-xl font-bold text-white"><span style={{color:COLOR}}>{SOLD} licenças</span> já ativadas</p>
          <p className="text-sm text-zinc-400 mt-1">Restam apenas {LEFT} neste lote promocional</p>
          <div className="mt-4 h-2.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full rounded-full apulse" style={{width:`${SOLD}%`,background:`linear-gradient(90deg,${COLOR},${CYAN})`}} /></div>
          <p className="mt-3 text-sm font-semibold" style={{color:CYAN}}>Próximo lote: R$ {PRICE_NEXT_LOT}</p>
          <p className="mt-1 text-xs text-zinc-500">Economize R$ 30,00 comprando agora</p>
        </Card></div></Reveal>
      </section>

      <CTABlock txt="Garantir Minha Licença com Desconto" />

      {/* 6. COMO FUNCIONA */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead sub="Em menos de 2 minutos você já está no controle">Como Funciona</SectionHead>
        <div className="mx-auto max-w-4xl"><div className="grid gap-4 sm:grid-cols-4">
          {[{n:'1',icon:<Send size={18}/>,t:'Pagamento',d:'Pix, cartão ou boleto'},{n:'2',icon:<Zap size={18}/>,t:'Acesso',d:'Receba seu acesso por e-mail'},{n:'3',icon:<Smartphone size={18}/>,t:'Login',d:'Entre e crie sua senha'},{n:'4',icon:<TrendingUp size={18}/>,t:'Organize',d:'Comece a controlar suas finanças'}].map((s,i)=><Reveal key={i} cls="text-center"><div className="flex flex-col items-center gap-3"><div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black" style={{background:`linear-gradient(135deg,${COLOR},${CYAN})`}}>{s.n}</div><div className="w-12 h-12 rounded-xl glass flex items-center justify-center" style={{color:COLOR}}>{s.icon}</div><div><p className="text-sm font-bold text-white">{s.t}</p><p className="text-xs text-zinc-400 mt-0.5">{s.d}</p></div></div></Reveal>)}
        </div></div>
      </section>

      {/* 7. DEPOIMENTOS */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead sub="⭐ 4.9 estrelas em mais de 500 avaliações">Quem usa recomenda</SectionHead>
        <div className="mx-auto max-w-5xl"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {depoimentos.map((d,i)=><Reveal key={i}><Card cls="!bg-white/[.06] flex flex-col h-full"><div className="flex gap-0.5 mb-3">{Array(5).fill(0).map((_,j)=><Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />)}</div><p className="text-sm text-zinc-300 leading-relaxed italic flex-1">{d.txt}</p><div className="mt-4 pt-4 border-t border-white/5"><p className="text-xs py-1 px-2 rounded-lg inline-block" style={{background:COLOR+'15',color:COLOR}}>{d.res}</p></div><div className="flex items-center gap-3 mt-3"><img src={`https://i.pravatar.cc/80?img=${d.img}`} alt={d.n} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" /><div><p className="text-xs font-semibold text-white">{d.n}</p><p className="text-[10px] text-zinc-500">{d.r}</p></div></div></Card></Reveal>)}
        </div>
        <div className="text-center mt-8"><Btn>Quero Ser o Próximo Caso de Sucesso <ArrowRight size={16} /></Btn></div></div>
      </section>

      {/* 8. TRANSFORMAÇÃO — DE → PARA */}
      <section className="px-4 py-16">
        <SectionHead sub="O que muda na sua vida depois de começar a usar">A transformação que você terá</SectionHead>
        <div className="mx-auto max-w-3xl"><Reveal><div className="glass rounded-3xl overflow-hidden grid grid-cols-2">
          <div className="p-5 md:p-8 border-r border-white/5"><p className="text-sm font-bold text-red-400 mb-4">❌ DE</p>
            {['Dinheiro sem controle','Contas esquecidas','Juros e atrasos','Lucro desconhecido','Ansiedade financeira','Decisões no escuro'].map((t,i)=><div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"><X size={14} className="text-red-500 shrink-0" /><span className="text-xs text-zinc-400">{t}</span></div>)}
          </div>
          <div className="p-5 md:p-8" style={{background:COLOR+'08'}}><p className="text-sm font-bold text-emerald-400 mb-4">✅ PARA</p>
            {['Controle total das finanças','Organização financeira','Visão clara do negócio','Mais economia no mês','Tranquilidade e paz','Crescimento sustentável'].map((t,i)=><div key={i} className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"><Check size={14} className="text-emerald-500 shrink-0" /><span className="text-xs text-zinc-300">{t}</span></div>)}
          </div>
        </div></Reveal>
        <div className="text-center mt-6"><Btn>Quero Essa Transformação <ArrowRight size={16} /></Btn></div></div>
      </section>

      {/* 9. VALOR PERCEBIDO */}
      <section ref={pr} className="px-4 py-16 border-t border-white/5">
        <SectionHead sub="Se você fosse comprar cada módulo separadamente...">Quanto custaria tudo separado?</SectionHead>
        <div className="mx-auto max-w-2xl">
          <Reveal><Card cls="!bg-white/[.06]"><div className="space-y-2">{modulos.map((m,i)=><div key={i} className="flex justify-between items-center text-sm py-1.5 border-b border-white/5 last:border-0"><span className="text-zinc-400">{m.name}</span><span className="text-zinc-300 font-medium">R$ {m.price}</span></div>)}</div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center"><span className="text-sm font-bold text-white">Valor Total</span><span className="text-lg font-black text-red-400 line-through">R$ {TOTAL_MODULOS.toFixed(2).replace('.',',')}</span></div>
          </Card></Reveal>
          <div className="mt-8 text-center">
            {pStep>=1 && <div className="aprice space-y-2"><div className="flex items-center justify-center gap-3"><ArrowDown size={20} style={{color:COLOR}} /><span className="text-xl font-black text-zinc-500 line-through">R$ 197,90</span></div></div>}
            {pStep>=2 && <div className="aprice mt-2"><div className="flex items-center justify-center gap-3"><ArrowDown size={20} style={{color:COLOR}} /><span className="text-xl font-black text-zinc-500 line-through">R$ {PRICE_NORMAL}</span></div></div>}
            {pStep>=3 && <div className="aprice mt-6"><div className="inline-flex flex-col items-center glassS rounded-3xl p-6 md:p-8" style={{borderColor:COLOR+'50'}}>
              <p className="text-sm text-zinc-400 mb-1">HOJE você leva tudo por apenas</p>
              <p className="text-5xl md:text-7xl font-black apulse gradtxt">R$ {PRICE_PROMO}</p>
              <p className="text-sm text-zinc-500 mt-1">pagamento único · acesso vitalício</p>
              <p className="mt-3 text-xs text-emerald-400 font-semibold">Você economiza R$ {TOTAL_MODULOS.toFixed(2).replace('.',',')}!</p>
            </div></div>}
            {pStep>=3 && <div className="mt-6 afade"><Btn big full>QUERO ECONOMIZAR R$ {TOTAL_MODULOS.toFixed(2).replace('.',',')} AGORA <ArrowRight size={20} /></Btn></div>}
          </div>
        </div>
      </section>

      {/* 10. GARANTIA PREMIUM */}
      <section className="px-4 py-16">
        <Reveal><div className="mx-auto max-w-2xl text-center"><div className="glassS rounded-3xl p-6 md:p-10" style={{borderColor:'#22C55E30'}}>
          <Shield size={56} className="mx-auto mb-5 text-emerald-400" />
          <h2 className="text-xl md:text-3xl font-black text-white">Você tem 7 dias para testar tudo sem risco</h2>
          <div className="mt-5 space-y-2 text-left max-w-sm mx-auto">
            {['Use todas as funcionalidades','Cadastre receitas e despesas','Controle seus cartões','Crie metas financeiras','Analise relatórios completos','Controle sua empresa'].map((t,i)=><div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0" /><span className="text-zinc-300">{t}</span></div>)}
          </div>
          <p className="mt-5 text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">Se dentro dos próximos 7 dias você entender que o {APP} não é para você, basta solicitar o reembolso. <span className="text-white font-semibold">Nós devolvemos 100% do seu dinheiro.</span> Sem perguntas. Sem burocracia. Sem risco.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <div className="glass rounded-2xl px-4 py-3 text-center"><p className="text-lg font-black text-emerald-400">RISCO ZERO</p><p className="text-[10px] text-zinc-500">garantia total</p></div>
            <div className="glass rounded-2xl px-4 py-3 text-center"><p className="text-lg font-black text-white">7 DIAS</p><p className="text-[10px] text-zinc-500">de garantia</p></div>
            <div className="glass rounded-2xl px-4 py-3 text-center"><p className="text-lg font-black text-emerald-400">100%</p><p className="text-[10px] text-zinc-500">do dinheiro de volta</p></div>
          </div>
        </div></div></Reveal>
      </section>

      {/* 11. FAQ */}
      <section className="px-4 py-16 border-t border-white/5">
        <SectionHead>Perguntas Frequentes</SectionHead>
        <div className="mx-auto max-w-2xl"><div className="space-y-2">
          {[{q:'O pagamento é único?',a:'Sim! Pagamento único com acesso vitalício. Todas as atualizações futuras são gratuitas.'},{q:'Funciona para MEI?',a:'Sim. Módulo empresarial completo: fluxo de caixa, DRE, contas a pagar/receber e relatórios gerenciais.'},{q:'Funciona no celular?',a:'Sim! 100% responsivo. Funciona em celular, tablet e computador.'},{q:'Como recebo o acesso?',a:'Após confirmar o pagamento, você recebe um e-mail com instruções para criar sua senha e acessar.'},{q:'Tem suporte?',a:'Sim. Chat na plataforma com resposta em até 48 horas úteis.'}].map((f,i)=>
            <Card key={i} cls="!p-0 overflow-hidden"><button onClick={()=>setFaq(faq===i?null:i)} className="w-full flex items-center justify-between p-4 text-left"><span className="text-sm font-medium text-white pr-4">{f.q}</span>{faq===i?<ChevronUp size={16} className="text-zinc-500 shrink-0" />:<ChevronDown size={16} className="text-zinc-500 shrink-0" />}</button>{faq===i&&<div className="px-4 pb-4 border-t border-white/5"><p className="text-sm text-zinc-400 leading-relaxed pt-3">{f.a}</p></div>}</Card>
          )}</div></div>
      </section>

      {/* 12. OFERTA FINAL */}
      <section className="px-4 py-16 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center"><Reveal><div className="glassS rounded-3xl p-6 md:p-10" style={{borderColor:COLOR+'50'}}>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 mb-4"><Zap size={12} /> Oferta Especial</div>
          <h2 className="text-xl md:text-3xl font-black text-white">Tudo que você precisa para dominar suas finanças</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {['Sistema de finanças pessoais','Sistema de finanças empresariais','Controle de receitas e despesas','Controle de cartões','Metas financeiras','Planejamento orçamentário','Simulador de investimentos','Fluxo de caixa empresarial','DRE simplificado','Contas a pagar','Relatórios exportáveis','Dashboard inteligente','Funciona no celular e computador','Sincronização em nuvem','Licença vitalícia','Acesso imediato','Garantia de 7 dias'].map((t,i)=><div key={i} className="flex items-center gap-2 text-sm"><Check size={14} className="text-emerald-400 shrink-0" /><span className="text-zinc-300">{t}</span></div>)}
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-zinc-500">Valor individual dos módulos: <span className="line-through text-red-400">R$ {TOTAL_MODULOS.toFixed(2).replace('.',',')}</span></p>
            <p className="text-xs text-zinc-500 mt-0.5">Valor normal: <span className="line-through">R$ {PRICE_NORMAL}</span></p>
            <p className="text-5xl md:text-7xl font-black mt-2 gradtxt">R$ {PRICE_PROMO}</p>
            <p className="text-sm text-zinc-400 mt-1">pagamento único · acesso vitalício · 7 dias de garantia</p>
            <p className="text-xs text-emerald-400 font-semibold mt-2">Economia imediata: R$ {TOTAL_MODULOS.toFixed(2).replace('.',',')}!</p>
          </div>
          <div className="mt-6"><Btn big full>QUERO MINHA LICENÇA VITALÍCIA <ArrowRight size={22} /></Btn></div>
          <div className="flex items-center justify-center gap-3 mt-4 text-[10px] md:text-xs text-zinc-500 flex-wrap">
            <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-400" />Garantia 7 dias</span>
            <span className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" />Vitalício</span>
            <span className="flex items-center gap-1"><Smartphone size={12} />Celular e PC</span>
            <span className="flex items-center gap-1">☁️ Nuvem</span>
          </div>
        </div></Reveal>
        <div id="stats" className="grid grid-cols-2 gap-4 mt-8">
          <Card cls="text-center"><p className="text-3xl md:text-4xl font-black text-white">{nums.u.toLocaleString()}+</p><p className="text-xs text-zinc-500 mt-1">Usuários ativos</p></Card>
          <Card cls="text-center"><p className="text-3xl md:text-4xl font-black text-white">R$ {nums.s.toLocaleString()}</p><p className="text-xs text-zinc-500 mt-1">Economizados</p></Card>
        </div></div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 py-10 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Já é cliente no footer */}
          <div className="glass rounded-2xl p-5 mb-8 text-center">
            <p className="text-sm font-bold text-white">Já comprou o {APP}?</p>
            <p className="text-xs text-zinc-400 mt-1">Seu acesso já está liberado. Faça login com o e-mail da compra.</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <a href="/login" className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-2.5 text-sm font-medium text-white transition-all">
                Fazer Login <ArrowRight size={14} />
              </a>
              <a href="/primeiro-acesso" className="text-xs text-zinc-500 hover:text-cyan-400">
                Criar senha
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs md:text-sm">
          <div><p className="font-bold text-white mb-3">{APP}</p><p className="text-zinc-500">Sistema completo de finanças pessoais e empresariais.</p></div>
          <div><p className="font-bold text-white mb-3">Produto</p><div className="space-y-1.5 text-zinc-500"><p>Funcionalidades</p><p>Preço</p><p>Garantia</p><p>FAQ</p></div></div>
          <div><p className="font-bold text-white mb-3">Suporte</p><div className="space-y-1.5 text-zinc-500"><p>Central de Ajuda</p><p>Contato</p><p>Chat na Plataforma</p></div></div>
          <div><p className="font-bold text-white mb-3">Legal</p><div className="space-y-1.5 text-zinc-500"><p>Política de Privacidade</p><p>Termos de Uso</p><p>7 Dias de Garantia</p></div></div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/8 text-center text-[10px] md:text-xs text-zinc-600"><p>{APP} © {new Date().getFullYear()} · Todos os direitos reservados</p><p className="mt-1">Cakto · Pagamento 100% seguro · Licença vitalícia</p></div>
      </div></footer>

      {/* CTA FLUTUANTE MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2.5" style={{background:'rgba(10,6,20,.95)',backdropFilter:'blur(16px)',borderTop:'1px solid rgba(255,255,255,.08)'}}>
        <a href={CHECKOUT} target="_blank" rel="noopener noreferrer" onClick={()=>track('Mobile')} className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white active:scale-[.98]" style={{background:`linear-gradient(135deg,${COLOR},#7C3AED)`}}><Zap size={16} /> QUERO MINHA LICENÇA · R$ {PRICE_PROMO}</a>
      </div>
    </div>
  )
}

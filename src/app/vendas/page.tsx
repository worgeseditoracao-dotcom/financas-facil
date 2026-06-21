'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'
import { CheckCircle2, ArrowRight, Shield, ChevronDown, ChevronUp, Smartphone, Monitor, BarChart3, Target, CreditCard, FileText, PiggyBank, TrendingUp, Users, DollarSign } from 'lucide-react'
import { CAKTO_CHECKOUT_URL, APP_NAME, APP_PRICE, APP_PRICE_PIX, APP_PRICE_INSTALLMENTS, SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/config'

const PIXEL_ID = '1193761196228886'

function trackEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, data)
  }
}

function trackCheckout() {
  trackEvent('InitiateCheckout', {
    content_name: 'Finanças Fácil - Acesso Vitalício',
    value: 67.00,
    currency: 'BRL',
  })
}

const faq = [
  { q: 'O que é o Finanças Fácil?', a: 'É um sistema completo de gestão financeira pessoal e empresarial. Você controla receitas, despesas, contas, cartões, metas, investimentos e muito mais em um só lugar.' },
  { q: 'Preciso instalar algo?', a: 'Não. O Finanças Fácil funciona direto do navegador no celular, tablet ou computador.' },
  { q: 'Funciona no celular?', a: 'Sim. O sistema é responsivo e funciona perfeitamente no celular, tablet e computador.' },
  { q: 'É para pessoa física ou jurídica?', a: 'Ambos. Você pode usar para controlar finanças pessoais e também o fluxo de caixa do seu negócio.' },
  { q: 'Como funciona o pagamento?', a: 'O pagamento é processado pela Cakto, plataforma 100% segura. Aceitamos PIX, cartão de crédito e boleto.' },
  { q: 'Tem garantia?', a: 'Sim. Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.' },
  { q: 'O acesso é vitalício?', a: 'Sim. Você paga uma única vez e tem acesso vitalício ao sistema, incluindo todas as atualizações futuras.' },
]

const benefits = [
  { icon: BarChart3, title: 'Visão completa', desc: 'Saiba exatamente para onde seu dinheiro está indo com relatórios automáticos' },
  { icon: Target, title: 'Metas financeiras', desc: 'Defina objetivos e acompanhe o progresso em tempo real' },
  { icon: CreditCard, title: 'Cartões de crédito', desc: 'Controle limite, fatura e compras parceladas de todos os cartões' },
  { icon: FileText, title: 'Relatórios', desc: 'Exporte dados em PDF, Excel e CSV com um clique' },
  { icon: PiggyBank, title: 'Investimentos', desc: 'Simule rendimentos e acompanhe sua carteira de investimentos' },
  { icon: TrendingUp, title: 'Fluxo de caixa', desc: 'Veja entradas, saídas e saldo projetado para tomar melhores decisões' },
  { icon: Users, title: 'Gestão empresarial', desc: 'Controle clientes, produtos, custos operacionais e margem de lucro' },
  { icon: DollarSign, title: 'Contas a receber', desc: 'Nunca mais esqueça de cobrar um cliente com alertas automáticos' },
]

export default function Vendas() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    trackEvent('PageView')
  }, [])

  const handleBuy = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackCheckout()
    // Deixa o link seguir normalmente
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Meta Pixel */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold" style={{ color: 'var(--accent, #A855F7)' }}>Finanças Fácil</span>
          <div className="flex items-center gap-2">
            <a href="/login"
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              Já comprei / Entrar
            </a>
            <a href={CAKTO_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" onClick={handleBuy}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-600 transition-colors">
              Comprar Agora
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle2 size={14} /> Lançamento oficial
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-6xl">
              Organize sua vida financeira em poucos minutos
            </h1>
            <p className="mt-6 text-lg text-zinc-500 md:text-xl">
              Controle receitas, despesas, contas, metas, cartões e relatórios em um único app simples, bonito e fácil de usar.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href={CAKTO_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" onClick={handleBuy}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-black hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25">
                Quero Organizar Minhas Finanças <ArrowRight size={20} />
              </a>
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              {APP_PRICE_PIX} no PIX ou {APP_PRICE_INSTALLMENTS} no cartão · Acesso vitalício
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-20">
          <div className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white p-2 shadow-xl">
            <img src="/mockup-dashboard.png" alt="Dashboard do Finanças Fácil" className="w-full rounded-xl border border-zinc-100"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className="p-8 text-center text-zinc-400">
              <Monitor size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Dashboard com visão completa das suas finanças</p>
            </div>
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">Para quem é o Finanças Fácil?</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-lg">PF</div>
              <h3 className="font-semibold text-zinc-900">Pessoa Física</h3>
              <p className="mt-2 text-sm text-zinc-500">Controle seu orçamento, acompanhe gastos, economize para metas e invista melhor seu dinheiro.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-lg">PJ</div>
              <h3 className="font-semibold text-zinc-900">Pequeno Negócio</h3>
              <p className="mt-2 text-sm text-zinc-500">Gerencie fluxo de caixa, contas a pagar/receber, clientes, produtos e custos operacionais.</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-lg">FL</div>
              <h3 className="font-semibold text-zinc-900">Freelancer / Autônomo</h3>
              <p className="mt-2 text-sm text-zinc-500">Separe finanças pessoais das profissionais, controle recebimentos e emita relatórios.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-zinc-900 md:text-4xl">Tudo que você precisa em um só lugar</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-6 hover:border-emerald-500/30 hover:shadow-md transition-all">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10" style={{ color: 'var(--accent, #A855F7)' }}>
                  <b.icon size={20} />
                </div>
                <h3 className="font-semibold text-zinc-900">{b.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-zinc-900 md:text-4xl">Funcionalidades completas</h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Dashboard com visão geral', 'Controle de receitas e despesas', 'Contas a pagar e receber',
              'Gestão de cartões de crédito', 'Metas financeiras', 'Investimentos com simulador',
              'Planejamento orçamentário', 'Relatórios detalhados', 'Exportação PDF, Excel e CSV',
              'Gestão de clientes', 'Controle de produtos', 'Custos operacionais',
              'Indicadores empresariais', 'Conciliação bancária', 'Insights inteligentes',
              'Contas bancárias', 'Fornecedores', 'Assinaturas recorrentes',
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white border border-zinc-200 px-4 py-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-700">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-lg">
            <div className="rounded-3xl border-2 border-emerald-500 bg-white p-8 text-center shadow-xl shadow-emerald-500/10">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                Mais vendido
              </div>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">Acesso Completo</h3>
              <p className="mt-2 text-sm text-zinc-500">Acesso vitalício a todas as funcionalidades</p>
              <div className="mt-6">
                <span className="text-5xl font-bold text-zinc-900">{APP_PRICE}</span>
                <p className="mt-1 text-sm text-zinc-400">ou {APP_PRICE_PIX} no PIX</p>
                <p className="text-xs text-zinc-400">{APP_PRICE_INSTALLMENTS} no cartão</p>
              </div>
              <ul className="mt-6 space-y-3 text-left text-sm">
                {[
                  'Todas as funcionalidades', 'Acesso vitalício', 'Atualizações gratuitas',
                  'Suporte prioritário', 'Exportação de dados', 'Use em qualquer dispositivo',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    <span className="text-zinc-700">{item}</span>
                  </li>
                ))}
              </ul>
              <a href={CAKTO_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" onClick={handleBuy}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-black hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25">
                Quero Comprar Agora <ArrowRight size={20} />
              </a>
            </div>
            {/* Garantia */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <Shield size={24} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-900">Garantia de 7 dias</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold text-zinc-900 md:text-4xl">Perguntas Frequentes</h2>
          <div className="mt-12 space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-zinc-50 transition-colors">
                  <span className="text-sm font-medium text-zinc-900">{item.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-zinc-400 shrink-0" /> : <ChevronDown size={16} className="text-zinc-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="border-t border-zinc-100 px-4 pb-4 pt-3">
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">Pronto para organizar suas finanças?</h2>
          <p className="mt-4 text-lg text-zinc-500">
            Mais de 1000 pessoas já estão usando o Finanças Fácil para controlar o dinheiro de verdade.
          </p>
          <a href={CAKTO_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" onClick={handleBuy}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-10 py-4 text-base font-semibold text-black hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25">
            Quero Meu Acesso Agora <ArrowRight size={20} />
          </a>
          <p className="mt-3 text-sm text-zinc-400">7 dias de garantia · Acesso vitalício · Suporte prioritário</p>

          <div className="mt-8 pt-8 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">Já comprou?</p>
            <a href="/login" className="mt-2 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              Fazer Login
            </a>
            <span className="mx-2 text-zinc-300">ou</span>
            <a href="/primeiro-acesso" className="text-sm font-medium text-emerald-500 hover:text-emerald-600">
              Criar senha (primeiro acesso)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-400">
          <p>Finanças Fácil © {new Date().getFullYear()} · Todos os direitos reservados</p>
          <p className="mt-1">
            Suporte:{' '}
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">
              WhatsApp
            </a>
            {' · '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-500 hover:underline">Email</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

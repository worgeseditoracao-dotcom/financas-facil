import { v4 as uuid } from 'uuid'
import type { Category } from './types'

export const ACCENT_COLORS = [
  { name: 'Roxo', value: '#A855F7' },
  { name: 'Verde', value: '#00FF88' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Vermelho', value: '#FF4444' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Amarelo', value: '#EAB308' },
]

export const INVESTMENT_TYPES = [
  { value: 'selic', label: 'Selic (CDI)', rate: 0.1475 },
  { value: 'cdb', label: 'CDB', rate: 0.14 },
  { value: 'tesouro_direto', label: 'Tesouro Direto', rate: 0.1475 },
  { value: 'poupanca', label: 'Poupança', rate: 0.065 },
  { value: 'ipca', label: 'Tesouro IPCA+', rate: 0.06 },
  { value: 'pfixa', label: 'Renda Fixa', rate: 0.13 },
  { value: 'acoes', label: 'Ações', rate: 0.15 },
  { value: 'fii', label: 'FIIs', rate: 0.12 },
  { value: 'crypto', label: 'Criptomoedas', rate: 0.25 },
]

export const BANKS = [
  'Nubank', 'Itaú', 'Bradesco', 'Santander', 'Caixa', 'Banco do Brasil',
  'Inter', 'BTG Pactual', 'C6 Bank', 'PicPay', 'Mercado Pago', 'Safra',
  'Original', 'Neon', 'Outro'
]

export const DEFAULT_PERSONAL_CATEGORIES: Category[] = [
  { id: uuid(), name: 'Salário', color: '#A855F7', icon: 'briefcase', module: 'personal' },
  { id: uuid(), name: 'Alimentação', color: '#F97316', icon: 'utensils-crossed', module: 'personal' },
  { id: uuid(), name: 'Transporte', color: '#3B82F6', icon: 'car', module: 'personal' },
  { id: uuid(), name: 'Saúde', color: '#FF4444', icon: 'heart-pulse', module: 'personal' },
  { id: uuid(), name: 'Educação', color: '#8B5CF6', icon: 'book-open', module: 'personal' },
  { id: uuid(), name: 'Lazer', color: '#EC4899', icon: 'gamepad-2', module: 'personal' },
  { id: uuid(), name: 'Moradia', color: '#06B6D4', icon: 'home', module: 'personal' },
  { id: uuid(), name: 'Cartão de Crédito', color: '#FF4444', icon: 'credit-card', module: 'personal' },
  { id: uuid(), name: 'Investimentos', color: '#A855F7', icon: 'trending-up', module: 'personal' },
]

export const DEFAULT_BUSINESS_CATEGORIES: Category[] = [
  { id: uuid(), name: 'Vendas', color: '#A855F7', icon: 'trending-up', module: 'business' },
  { id: uuid(), name: 'Serviços', color: '#3B82F6', icon: 'briefcase', module: 'business' },
  { id: uuid(), name: 'Marketing', color: '#F97316', icon: 'megaphone', module: 'business' },
  { id: uuid(), name: 'Ferramentas', color: '#06B6D4', icon: 'wrench', module: 'business' },
  { id: uuid(), name: 'Impostos', color: '#FF4444', icon: 'landmark', module: 'business' },
  { id: uuid(), name: 'Funcionários', color: '#FF4444', icon: 'users', module: 'business' },
  { id: uuid(), name: 'Operacional', color: '#8B5CF6', icon: 'settings', module: 'business' },
  { id: uuid(), name: 'Cartão PJ', color: '#FF4444', icon: 'credit-card', module: 'business' },
]

export const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const COLORS = [
  '#A855F7', '#F97316', '#3B82F6', '#FF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#EAB308', '#6366F1', '#22C55E',
  '#14B8A6', '#D946EF', '#F43F5E', '#0EA5E9', '#A855F7',
]

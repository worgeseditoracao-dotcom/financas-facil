'use client'

import { createContext, useContext, useCallback, useReducer, useEffect, type ReactNode } from 'react'
import { v4 as uuid } from 'uuid'
import type { Transaction, Category, Goal, Client, Bill, Budget, Investment, BankAccount, CreditCard, CardPurchase, Subscription, BusinessProduct, BusinessInfo, AppSettings, Receivable, Supplier, StatementEntry } from './types'
import { DEFAULT_PERSONAL_CATEGORIES, DEFAULT_BUSINESS_CATEGORIES } from './constants'

interface State {
  transactions: Transaction[]
  personalCategories: Category[]
  businessCategories: Category[]
  goals: Goal[]
  clients: Client[]
  bills: Bill[]
  budgets: Budget[]
  investments: Investment[]
  bankAccounts: BankAccount[]
  creditCards: CreditCard[]
  subscriptions: Subscription[]
  businessProducts: BusinessProduct[]
  businessInfo: BusinessInfo[]
  receivables: Receivable[]
  suppliers: Supplier[]
  statementEntries: StatementEntry[]
  settings: AppSettings
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL'; payload: Bill }
  | { type: 'DELETE_BILL'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'UPDATE_INVESTMENT'; payload: Investment }
  | { type: 'DELETE_INVESTMENT'; payload: string }
  | { type: 'ADD_BANK_ACCOUNT'; payload: BankAccount }
  | { type: 'UPDATE_BANK_ACCOUNT'; payload: BankAccount }
  | { type: 'DELETE_BANK_ACCOUNT'; payload: string }
  | { type: 'ADD_CREDIT_CARD'; payload: CreditCard }
  | { type: 'UPDATE_CREDIT_CARD'; payload: CreditCard }
  | { type: 'DELETE_CREDIT_CARD'; payload: string }
  | { type: 'ADD_CARD_PURCHASE'; payload: { cardId: string; purchase: CardPurchase } }
  | { type: 'REMOVE_CARD_PURCHASE'; payload: { cardId: string; purchaseId: string } }
  | { type: 'TOGGLE_CARD_PURCHASE'; payload: { cardId: string; purchaseId: string } }
  | { type: 'ADD_SUBSCRIPTION'; payload: Subscription }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: Subscription }
  | { type: 'DELETE_SUBSCRIPTION'; payload: string }
  | { type: 'ADD_BUSINESS_PRODUCT'; payload: BusinessProduct }
  | { type: 'UPDATE_BUSINESS_PRODUCT'; payload: BusinessProduct }
  | { type: 'DELETE_BUSINESS_PRODUCT'; payload: string }
  | { type: 'UPDATE_BUSINESS_INFO'; payload: BusinessInfo }
  | { type: 'ADD_RECEIVABLE'; payload: Receivable }
  | { type: 'UPDATE_RECEIVABLE'; payload: Receivable }
  | { type: 'DELETE_RECEIVABLE'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'IMPORT_STATEMENT'; payload: StatementEntry[] }
  | { type: 'MATCH_STATEMENT_ENTRY'; payload: { entryId: string; transactionId: string } }
  | { type: 'UNMATCH_STATEMENT_ENTRY'; payload: string }
  | { type: 'IGNORE_STATEMENT_ENTRY'; payload: string }
  | { type: 'DELETE_STATEMENT_ENTRY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'LOAD_DATA'; payload: State }

const STORAGE_KEY = 'financas-facil-data'

function defaultState(): State {
  return {
    transactions: [],
    personalCategories: DEFAULT_PERSONAL_CATEGORIES,
    businessCategories: DEFAULT_BUSINESS_CATEGORIES,
    goals: [], clients: [], bills: [], budgets: [],
    investments: [], bankAccounts: [], creditCards: [],
    subscriptions: [], businessProducts: [], businessInfo: [],
    receivables: [], suppliers: [], statementEntries: [],
    settings: { accentColor: '#A855F7', currency: 'BRL', name: 'Usuário' },
  }
}

function loadState(): State {
  if (typeof window === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        transactions: parsed.transactions || [],
        personalCategories: parsed.personalCategories?.length ? parsed.personalCategories : DEFAULT_PERSONAL_CATEGORIES,
        businessCategories: parsed.businessCategories?.length ? parsed.businessCategories : DEFAULT_BUSINESS_CATEGORIES,
        goals: parsed.goals || [],
        clients: parsed.clients || [],
        bills: parsed.bills || [],
        budgets: parsed.budgets || [],
        investments: parsed.investments || [],
        bankAccounts: parsed.bankAccounts || [],
        creditCards: parsed.creditCards || [],
        subscriptions: parsed.subscriptions || [],
        businessProducts: parsed.businessProducts || [],
        businessInfo: parsed.businessInfo || [],
        receivables: parsed.receivables || [],
        suppliers: parsed.suppliers || [],
        statementEntries: parsed.statementEntries || [],
        settings: parsed.settings || { accentColor: '#A855F7', currency: 'BRL', name: 'Usuário' },
      }
    }
  } catch {}
  return defaultState()
}

function saveState(state: State) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }
    case 'ADD_CATEGORY':
      if (action.payload.module === 'personal')
        return { ...state, personalCategories: [...state.personalCategories, action.payload] }
      return { ...state, businessCategories: [...state.businessCategories, action.payload] }
    case 'UPDATE_CATEGORY':
      if (action.payload.module === 'personal')
        return { ...state, personalCategories: state.personalCategories.map(c => c.id === action.payload.id ? action.payload : c) }
      return { ...state, businessCategories: state.businessCategories.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CATEGORY':
      return { ...state, personalCategories: state.personalCategories.filter(c => c.id !== action.payload), businessCategories: state.businessCategories.filter(c => c.id !== action.payload) }
    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] }
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g) }
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) }
    case 'ADD_CLIENT':
      return { ...state, clients: [action.payload, ...state.clients] }
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) }
    case 'ADD_BILL':
      return { ...state, bills: [action.payload, ...state.bills] }
    case 'UPDATE_BILL':
      return { ...state, bills: state.bills.map(b => b.id === action.payload.id ? action.payload : b) }
    case 'DELETE_BILL':
      return { ...state, bills: state.bills.filter(b => b.id !== action.payload) }
    case 'SET_BUDGET':
      return { ...state, budgets: [...state.budgets.filter(b => !(b.month === action.payload.month && b.year === action.payload.year && b.module === action.payload.module)), action.payload] }
    case 'ADD_INVESTMENT':
      return { ...state, investments: [action.payload, ...state.investments] }
    case 'UPDATE_INVESTMENT':
      return { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'DELETE_INVESTMENT':
      return { ...state, investments: state.investments.filter(i => i.id !== action.payload) }
    case 'ADD_BANK_ACCOUNT':
      return { ...state, bankAccounts: [action.payload, ...state.bankAccounts] }
    case 'UPDATE_BANK_ACCOUNT':
      return { ...state, bankAccounts: state.bankAccounts.map(a => a.id === action.payload.id ? action.payload : a) }
    case 'DELETE_BANK_ACCOUNT':
      return { ...state, bankAccounts: state.bankAccounts.filter(a => a.id !== action.payload) }
    case 'ADD_CREDIT_CARD':
      return { ...state, creditCards: [action.payload, ...state.creditCards] }
    case 'UPDATE_CREDIT_CARD':
      return { ...state, creditCards: state.creditCards.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CREDIT_CARD':
      return { ...state, creditCards: state.creditCards.filter(c => c.id !== action.payload) }
    case 'ADD_CARD_PURCHASE':
      return { ...state, creditCards: state.creditCards.map(c => c.id === action.payload.cardId ? { ...c, purchases: [...c.purchases, action.payload.purchase] } : c) }
    case 'REMOVE_CARD_PURCHASE':
      return { ...state, creditCards: state.creditCards.map(c => c.id === action.payload.cardId ? { ...c, purchases: c.purchases.filter(p => p.id !== action.payload.purchaseId) } : c) }
    case 'TOGGLE_CARD_PURCHASE':
      return { ...state, creditCards: state.creditCards.map(c => c.id === action.payload.cardId ? { ...c, purchases: c.purchases.map(p => p.id === action.payload.purchaseId ? { ...p, paid: !p.paid } : p) } : c) }
    case 'ADD_SUBSCRIPTION':
      return { ...state, subscriptions: [action.payload, ...state.subscriptions] }
    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscriptions: state.subscriptions.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'DELETE_SUBSCRIPTION':
      return { ...state, subscriptions: state.subscriptions.filter(s => s.id !== action.payload) }
    case 'ADD_BUSINESS_PRODUCT':
      return { ...state, businessProducts: [action.payload, ...state.businessProducts] }
    case 'UPDATE_BUSINESS_PRODUCT':
      return { ...state, businessProducts: state.businessProducts.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_BUSINESS_PRODUCT':
      return { ...state, businessProducts: state.businessProducts.filter(p => p.id !== action.payload) }
    case 'UPDATE_BUSINESS_INFO':
      return { ...state, businessInfo: [...state.businessInfo.filter(b => b.id !== action.payload.id), action.payload] }
    case 'ADD_RECEIVABLE':
      return { ...state, receivables: [action.payload, ...state.receivables] }
    case 'UPDATE_RECEIVABLE':
      return { ...state, receivables: state.receivables.map(r => r.id === action.payload.id ? action.payload : r) }
    case 'DELETE_RECEIVABLE':
      return { ...state, receivables: state.receivables.filter(r => r.id !== action.payload) }
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [action.payload, ...state.suppliers] }
    case 'UPDATE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s) }
    case 'DELETE_SUPPLIER':
      return { ...state, suppliers: state.suppliers.filter(s => s.id !== action.payload) }
    case 'IMPORT_STATEMENT':
      return { ...state, statementEntries: [...action.payload, ...state.statementEntries] }
    case 'MATCH_STATEMENT_ENTRY':
      return { ...state, statementEntries: state.statementEntries.map(e =>
        e.id === action.payload.entryId ? { ...e, matchedTransactionId: action.payload.transactionId, manuallyMatched: true, ignored: false } : e
      )}
    case 'UNMATCH_STATEMENT_ENTRY':
      return { ...state, statementEntries: state.statementEntries.map(e =>
        e.id === action.payload ? { ...e, matchedTransactionId: undefined, manuallyMatched: false } : e
      )}
    case 'IGNORE_STATEMENT_ENTRY':
      return { ...state, statementEntries: state.statementEntries.map(e =>
        e.id === action.payload ? { ...e, ignored: !e.ignored, matchedTransactionId: undefined } : e
      )}
    case 'DELETE_STATEMENT_ENTRY':
      return { ...state, statementEntries: state.statementEntries.filter(e => e.id !== action.payload) }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    default:
      return state
  }
}

interface StoreContextType {
  state: State
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (t: Transaction) => void
  deleteTransaction: (id: string) => void
  addCategory: (data: Omit<Category, 'id'>) => void
  updateCategory: (c: Category) => void
  deleteCategory: (id: string) => void
  addGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (g: Goal) => void
  deleteGoal: (id: string) => void
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => void
  updateClient: (c: Client) => void
  deleteClient: (id: string) => void
  addBill: (data: Omit<Bill, 'id' | 'createdAt'>) => void
  updateBill: (b: Bill) => void
  deleteBill: (id: string) => void
  setBudget: (data: Omit<Budget, 'id' | 'createdAt'>) => void
  addInvestment: (data: Omit<Investment, 'id' | 'createdAt'>) => void
  updateInvestment: (i: Investment) => void
  deleteInvestment: (id: string) => void
  addBankAccount: (data: Omit<BankAccount, 'id' | 'createdAt'>) => void
  updateBankAccount: (a: BankAccount) => void
  deleteBankAccount: (id: string) => void
  addCreditCard: (data: Omit<CreditCard, 'id' | 'createdAt'>) => void
  updateCreditCard: (c: CreditCard) => void
  deleteCreditCard: (id: string) => void
  addCardPurchase: (cardId: string, purchase: Omit<CardPurchase, 'id'>) => void
  removeCardPurchase: (cardId: string, purchaseId: string) => void
  toggleCardPurchase: (cardId: string, purchaseId: string) => void
  addSubscription: (data: Omit<Subscription, 'id' | 'createdAt'>) => void
  updateSubscription: (s: Subscription) => void
  deleteSubscription: (id: string) => void
  addBusinessProduct: (data: Omit<BusinessProduct, 'id' | 'createdAt'>) => void
  updateBusinessProduct: (p: BusinessProduct) => void
  deleteBusinessProduct: (id: string) => void
  updateBusinessInfo: (data: BusinessInfo) => void
  addReceivable: (data: Omit<Receivable, 'id' | 'createdAt'>) => void
  updateReceivable: (r: Receivable) => void
  deleteReceivable: (id: string) => void
  addSupplier: (data: Omit<Supplier, 'id' | 'createdAt'>) => void
  deleteSupplier: (id: string) => void
  importStatement: (entries: Omit<StatementEntry, 'id'>[]) => void
  matchStatementEntry: (entryId: string, transactionId: string) => void
  unmatchStatementEntry: (entryId: string) => void
  ignoreStatementEntry: (entryId: string) => void
  deleteStatementEntry: (id: string) => void
  updateSettings: (s: Partial<AppSettings>) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => { saveState(state) }, [state])
  useEffect(() => { document.documentElement.style.setProperty('--accent', state.settings.accentColor) }, [state.settings.accentColor])

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>) =>
    dispatch({ type: 'ADD_TRANSACTION', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateTransaction = useCallback((t: Transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: t }), [])
  const deleteTransaction = useCallback((id: string) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }), [])
  const addCategory = useCallback((data: Omit<Category, 'id'>) => dispatch({ type: 'ADD_CATEGORY', payload: { ...data, id: uuid() } }), [])
  const updateCategory = useCallback((c: Category) => dispatch({ type: 'UPDATE_CATEGORY', payload: c }), [])
  const deleteCategory = useCallback((id: string) => dispatch({ type: 'DELETE_CATEGORY', payload: id }), [])
  const addGoal = useCallback((data: Omit<Goal, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_GOAL', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateGoal = useCallback((g: Goal) => dispatch({ type: 'UPDATE_GOAL', payload: g }), [])
  const deleteGoal = useCallback((id: string) => dispatch({ type: 'DELETE_GOAL', payload: id }), [])
  const addClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_CLIENT', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateClient = useCallback((c: Client) => dispatch({ type: 'UPDATE_CLIENT', payload: c }), [])
  const deleteClient = useCallback((id: string) => dispatch({ type: 'DELETE_CLIENT', payload: id }), [])
  const addBill = useCallback((data: Omit<Bill, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_BILL', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateBill = useCallback((b: Bill) => dispatch({ type: 'UPDATE_BILL', payload: b }), [])
  const deleteBill = useCallback((id: string) => dispatch({ type: 'DELETE_BILL', payload: id }), [])
  const setBudget = useCallback((data: Omit<Budget, 'id' | 'createdAt'>) => dispatch({ type: 'SET_BUDGET', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const addInvestment = useCallback((data: Omit<Investment, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_INVESTMENT', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateInvestment = useCallback((i: Investment) => dispatch({ type: 'UPDATE_INVESTMENT', payload: i }), [])
  const deleteInvestment = useCallback((id: string) => dispatch({ type: 'DELETE_INVESTMENT', payload: id }), [])
  const addBankAccount = useCallback((data: Omit<BankAccount, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_BANK_ACCOUNT', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateBankAccount = useCallback((a: BankAccount) => dispatch({ type: 'UPDATE_BANK_ACCOUNT', payload: a }), [])
  const deleteBankAccount = useCallback((id: string) => dispatch({ type: 'DELETE_BANK_ACCOUNT', payload: id }), [])
  const addCreditCard = useCallback((data: Omit<CreditCard, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_CREDIT_CARD', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateCreditCard = useCallback((c: CreditCard) => dispatch({ type: 'UPDATE_CREDIT_CARD', payload: c }), [])
  const deleteCreditCard = useCallback((id: string) => dispatch({ type: 'DELETE_CREDIT_CARD', payload: id }), [])
  const addCardPurchase = useCallback((cardId: string, purchase: Omit<CardPurchase, 'id'>) => dispatch({ type: 'ADD_CARD_PURCHASE', payload: { cardId, purchase: { ...purchase, id: uuid() } } }), [])
  const removeCardPurchase = useCallback((cardId: string, purchaseId: string) => dispatch({ type: 'REMOVE_CARD_PURCHASE', payload: { cardId, purchaseId } }), [])
  const toggleCardPurchase = useCallback((cardId: string, purchaseId: string) => dispatch({ type: 'TOGGLE_CARD_PURCHASE', payload: { cardId, purchaseId } }), [])
  const addSubscription = useCallback((data: Omit<Subscription, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_SUBSCRIPTION', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateSubscription = useCallback((s: Subscription) => dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: s }), [])
  const deleteSubscription = useCallback((id: string) => dispatch({ type: 'DELETE_SUBSCRIPTION', payload: id }), [])
  const addBusinessProduct = useCallback((data: Omit<BusinessProduct, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_BUSINESS_PRODUCT', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateBusinessProduct = useCallback((p: BusinessProduct) => dispatch({ type: 'UPDATE_BUSINESS_PRODUCT', payload: p }), [])
  const deleteBusinessProduct = useCallback((id: string) => dispatch({ type: 'DELETE_BUSINESS_PRODUCT', payload: id }), [])
  const updateBusinessInfo = useCallback((data: BusinessInfo) => dispatch({ type: 'UPDATE_BUSINESS_INFO', payload: data }), [])
  const addReceivable = useCallback((data: Omit<Receivable, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_RECEIVABLE', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateReceivable = useCallback((r: Receivable) => dispatch({ type: 'UPDATE_RECEIVABLE', payload: r }), [])
  const deleteReceivable = useCallback((id: string) => dispatch({ type: 'DELETE_RECEIVABLE', payload: id }), [])
  const addSupplier = useCallback((data: Omit<Supplier, 'id' | 'createdAt'>) => dispatch({ type: 'ADD_SUPPLIER', payload: { ...data, id: uuid(), createdAt: new Date().toISOString() } }), [])
  const updateSupplier = useCallback((s: Supplier) => dispatch({ type: 'UPDATE_SUPPLIER', payload: s }), [])
  const deleteSupplier = useCallback((id: string) => dispatch({ type: 'DELETE_SUPPLIER', payload: id }), [])
  const importStatement = useCallback((entries: Omit<StatementEntry, 'id'>[]) => {
    const full = entries.map(e => ({ ...e, id: uuid() }))
    dispatch({ type: 'IMPORT_STATEMENT', payload: full })
  }, [])
  const matchStatementEntry = useCallback((entryId: string, transactionId: string) =>
    dispatch({ type: 'MATCH_STATEMENT_ENTRY', payload: { entryId, transactionId } }), [])
  const unmatchStatementEntry = useCallback((entryId: string) =>
    dispatch({ type: 'UNMATCH_STATEMENT_ENTRY', payload: entryId }), [])
  const ignoreStatementEntry = useCallback((entryId: string) =>
    dispatch({ type: 'IGNORE_STATEMENT_ENTRY', payload: entryId }), [])
  const deleteStatementEntry = useCallback((id: string) =>
    dispatch({ type: 'DELETE_STATEMENT_ENTRY', payload: id }), [])
  const updateSettings = useCallback((s: Partial<AppSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: s }), [])

  return (
    <StoreContext.Provider value={{
      state, addTransaction, updateTransaction, deleteTransaction,
      addCategory, updateCategory, deleteCategory,
      addGoal, updateGoal, deleteGoal,
      addClient, updateClient, deleteClient,
      addBill, updateBill, deleteBill, setBudget,
      addInvestment, updateInvestment, deleteInvestment,
      addBankAccount, updateBankAccount, deleteBankAccount,
      addCreditCard, updateCreditCard, deleteCreditCard,
      addCardPurchase, removeCardPurchase, toggleCardPurchase,
      addSubscription, updateSubscription, deleteSubscription,
      addBusinessProduct, updateBusinessProduct, deleteBusinessProduct, updateBusinessInfo,
      addReceivable, updateReceivable, deleteReceivable,
      addSupplier, updateSupplier, deleteSupplier,
      importStatement, matchStatementEntry, unmatchStatementEntry, ignoreStatementEntry, deleteStatementEntry,
      updateSettings,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
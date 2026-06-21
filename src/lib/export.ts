import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { applyPlugin, autoTable as autoTableFn } from 'jspdf-autotable'
applyPlugin(jsPDF)
import type { Transaction } from './types'
import { formatCurrency, formatDate } from './utils'

export function exportToExcel(transactions: Transaction[], filename: string = 'financas-facil') {
  const data = transactions.map(t => ({
    Data: formatDate(t.date),
    Categoria: t.category,
    Descrição: t.description,
    Valor: t.value,
    Tipo: t.type === 'income' ? 'Receita' : 'Despesa',
    Módulo: t.module === 'personal' ? 'Pessoal' : 'Negócio',
  }))
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Finanças')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPDF(transactions: Transaction[], filename: string = 'financas-facil') {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Finanças Fácil', 14, 22)
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30)

  const total = transactions.reduce((acc, t) => acc + t.value, 0)
  doc.text(`Saldo Total: ${formatCurrency(total)}`, 14, 38)

  const tableData = transactions.map(t => [
    formatDate(t.date),
    t.category,
    t.description,
    formatCurrency(t.value),
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.module === 'personal' ? 'Pessoal' : 'Negócio',
  ])

  autoTableFn(doc, {
    startY: 45,
    head: [['Data', 'Categoria', 'Descrição', 'Valor', 'Tipo', 'Módulo']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
  })

  doc.save(`${filename}.pdf`)
}

export function exportToCSV(transactions: Transaction[], filename: string = 'financas-facil') {
  const header = 'Data,Categoria,Descrição,Valor,Tipo,Módulo'
  const rows = transactions.map(t =>
    `${formatDate(t.date)},"${t.category}","${t.description}",${t.value},${t.type === 'income' ? 'Receita' : 'Despesa'},${t.module === 'personal' ? 'Pessoal' : 'Negócio'}`
  )
  const bom = '\uFEFF'
  const csv = bom + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

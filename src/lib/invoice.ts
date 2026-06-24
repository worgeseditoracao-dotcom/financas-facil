import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { formatCurrency, formatDate } from './utils'

export function generateInvoicePDF(invoice: {
  id: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  items: { description: string; value: number }[]
  dueDate: string
  notes?: string
}) {
  const doc = new jsPDF()
  const today = new Date().toLocaleDateString('pt-BR')

  // Header
  doc.setFontSize(22)
  doc.setTextColor(139, 92, 246)
  doc.text('FATURA / NOTA FISCAL', 20, 25)

  doc.setFontSize(11)
  doc.setTextColor(100, 100, 100)
  doc.text(`Nº ${invoice.id.substring(0, 8).toUpperCase()}`, 20, 33)
  doc.text(`Emitido em: ${today}`, 20, 39)
  doc.text(`Vencimento: ${formatDate(invoice.dueDate)}`, 20, 45)

  // Client info
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('DADOS DO CLIENTE', 20, 58)
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text(invoice.clientName, 20, 65)
  if (invoice.clientEmail) doc.text(invoice.clientEmail, 20, 71)
  if (invoice.clientPhone) doc.text(invoice.clientPhone, 20, 77)

  // Items table
  const tableData = invoice.items.map((item, i) => [String(i + 1), item.description, formatCurrency(item.value)])
  const totalValue = invoice.items.reduce((sum, item) => sum + item.value, 0)

  doc.autoTable({
    startY: 85,
    head: [['#', 'Descrição', 'Valor']],
    body: tableData,
    foot: [['', 'TOTAL', formatCurrency(totalValue)]],
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
  })

  // Notes
  if (invoice.notes) {
    const finalY = (doc as any).lastAutoTable?.finalY || 150
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Observações:', 20, finalY + 15)
    doc.text(invoice.notes, 20, finalY + 22)
  }

  doc.save(`fatura-${invoice.id.substring(0, 8)}.pdf`)
  return { ok: true }
}

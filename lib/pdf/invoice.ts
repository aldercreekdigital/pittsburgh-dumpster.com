import { jsPDF } from 'jspdf'

interface LineItem {
  label: string
  quantity: number
  unit_price: number
  amount: number
}

interface InvoicePdfData {
  invoiceNumber: string
  status: string
  issuedAt: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  lineItems: LineItem[]
  subtotal: number
  total: number
  paidAt?: string
}

function formatCurrency(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function generateInvoicePdf(data: InvoicePdfData): ArrayBuffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Company info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Pittsburgh Dumpster', pageWidth / 2, y, { align: 'center' })
  y += 5
  doc.text('Pittsburgh, PA', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Invoice details box
  doc.setFillColor(245, 245, 245)
  doc.rect(15, y, pageWidth - 30, 25, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Invoice #${data.invoiceNumber}`, 20, y)

  const statusColor = data.status === 'paid' ? [34, 139, 34] : [220, 53, 69]
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
  doc.text(data.status.toUpperCase(), pageWidth - 20, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Issued: ${formatDate(data.issuedAt)}`, 20, y)
  if (data.paidAt) {
    doc.text(`Paid: ${formatDate(data.paidAt)}`, pageWidth - 20, y, { align: 'right' })
  }
  y += 20

  // Bill To section
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', 20, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.text(data.customerName, 20, y)
  y += 5
  doc.text(data.customerEmail, 20, y)
  y += 5
  if (data.customerPhone) {
    doc.text(data.customerPhone, 20, y)
    y += 5
  }
  y += 5

  // Service Address
  doc.setFont('helvetica', 'bold')
  doc.text('SERVICE ADDRESS', 20, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  // Word wrap address
  const addressLines = doc.splitTextToSize(data.address, pageWidth - 40)
  doc.text(addressLines, 20, y)
  y += addressLines.length * 5 + 10

  // Line items table header
  doc.setFillColor(34, 87, 54) // Primary green
  doc.rect(15, y, pageWidth - 30, 8, 'F')
  y += 6

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 20, y)
  doc.text('Qty', 110, y, { align: 'center' })
  doc.text('Unit Price', 140, y, { align: 'right' })
  doc.text('Amount', pageWidth - 20, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 8

  // Line items
  doc.setFont('helvetica', 'normal')
  data.lineItems.forEach((item) => {
    doc.text(item.label, 20, y)
    doc.text(item.quantity.toString(), 110, y, { align: 'center' })
    doc.text(formatCurrency(item.unit_price), 140, y, { align: 'right' })
    doc.text(formatCurrency(item.amount), pageWidth - 20, y, { align: 'right' })
    y += 7
  })

  // Separator line
  y += 3
  doc.setDrawColor(200, 200, 200)
  doc.line(15, y, pageWidth - 15, y)
  y += 10

  // Totals
  doc.setFontSize(10)
  doc.text('Subtotal:', 130, y, { align: 'right' })
  doc.text(formatCurrency(data.subtotal), pageWidth - 20, y, { align: 'right' })
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total:', 130, y, { align: 'right' })
  doc.text(formatCurrency(data.total), pageWidth - 20, y, { align: 'right' })
  y += 20

  // Footer
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(128, 128, 128)
  doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' })

  // Return as ArrayBuffer for Response compatibility
  return doc.output('arraybuffer') as ArrayBuffer
}

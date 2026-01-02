import { jsPDF } from 'jspdf'

interface LineItem {
  label: string
  amount: number
}

interface QuotePdfData {
  quoteId: string
  createdAt: string
  expiresAt?: string
  customerEmail?: string
  address: string
  dumpsterSize: number
  wasteType: string
  dropoffDate: string
  pickupDate: string
  rentalDays: number
  includedTons: number
  lineItems: LineItem[]
  total: number
  overagePerTon: number
}

function formatCurrency(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household Trash',
  construction_debris: 'Construction Debris',
}

export function generateQuotePdf(data: QuotePdfData): ArrayBuffer {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('QUOTE', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Company info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Pittsburgh Dumpster', pageWidth / 2, y, { align: 'center' })
  y += 5
  doc.text('Pittsburgh, PA', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Quote details box
  doc.setFillColor(245, 245, 245)
  doc.rect(15, y, pageWidth - 30, 20, 'F')
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Quote #${data.quoteId.slice(0, 8).toUpperCase()}`, 20, y)

  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Created: ${formatDate(data.createdAt)}`, 20, y)
  if (data.expiresAt) {
    doc.setTextColor(180, 0, 0)
    doc.text(`Expires: ${formatDate(data.expiresAt)}`, pageWidth - 20, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }
  y += 18

  // Service Details section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Service Details', 20, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  // Dumpster info with icon-like box
  doc.setFillColor(34, 87, 54) // Primary green
  doc.rect(20, y - 4, 40, 25, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.dumpsterSize}`, 40, y + 6, { align: 'center' })
  doc.setFontSize(9)
  doc.text('YARD', 40, y + 13, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // Details next to dumpster box
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Waste Type: ${WASTE_TYPE_LABELS[data.wasteType] || data.wasteType}`, 70, y + 2)
  doc.text(`Rental Period: ${data.rentalDays} days`, 70, y + 9)
  doc.text(`Included Weight: ${data.includedTons} ton(s)`, 70, y + 16)
  y += 30

  // Address
  doc.setFont('helvetica', 'bold')
  doc.text('Delivery Address', 20, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const addressLines = doc.splitTextToSize(data.address, pageWidth - 40)
  doc.text(addressLines, 20, y)
  y += addressLines.length * 5 + 8

  // Dates
  doc.setFont('helvetica', 'bold')
  doc.text('Schedule', 20, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(`Drop-off: ${formatDate(data.dropoffDate)}`, 20, y)
  y += 6
  doc.text(`Pick-up: ${formatDate(data.pickupDate)}`, 20, y)
  y += 15

  // Pricing section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Pricing', 20, y)
  y += 10

  // Line items
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  data.lineItems.forEach((item) => {
    doc.text(item.label, 25, y)
    doc.text(formatCurrency(item.amount), pageWidth - 25, y, { align: 'right' })
    y += 7
  })

  // Separator
  y += 3
  doc.setDrawColor(200, 200, 200)
  doc.line(20, y, pageWidth - 20, y)
  y += 10

  // Total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Total:', 120, y)
  doc.setTextColor(34, 87, 54) // Primary green
  doc.text(formatCurrency(data.total), pageWidth - 25, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 15

  // Overage notice
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`* Overage rate: ${formatCurrency(data.overagePerTon)}/ton over ${data.includedTons} ton(s)`, 20, y)
  y += 20

  // Terms box
  doc.setFillColor(255, 250, 230)
  doc.rect(15, y, pageWidth - 30, 35, 'F')
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Terms & Conditions', 20, y)
  y += 7

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  const terms = [
    '- Payment is due at time of booking confirmation.',
    '- Additional charges apply for weight exceeding included tonnage.',
    '- Prohibited items: hazardous waste, tires, batteries, appliances with freon.',
    '- Dumpster must be accessible for delivery and pickup.',
  ]
  terms.forEach((term) => {
    doc.text(term, 20, y)
    y += 5
  })

  // Footer
  y = doc.internal.pageSize.getHeight() - 20
  doc.setFontSize(9)
  doc.setTextColor(128, 128, 128)
  doc.text('Questions? Contact us at info@pittsburghdumpster.com', pageWidth / 2, y, { align: 'center' })

  // Return as ArrayBuffer for Response compatibility
  return doc.output('arraybuffer') as ArrayBuffer
}

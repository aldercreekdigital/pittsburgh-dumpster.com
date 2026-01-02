'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DumpTicket {
  id: string
  facility: string
  ticket_number: string
  net_tons: number
  ticket_datetime: string
  created_at: string
}

interface Adjustment {
  id: string
  kind: string
  amount: number
  status: string
  notes: string | null
  created_at: string
}

interface DumpTicketsProps {
  bookingId: string
  customerId: string
  includedTons: number
  overagePerTon: number
  dumpTickets: DumpTicket[]
  adjustments: Adjustment[]
  hasPaymentMethod: boolean
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function DumpTickets({
  bookingId,
  customerId,
  includedTons,
  overagePerTon,
  dumpTickets,
  adjustments,
  hasPaymentMethod,
}: DumpTicketsProps) {
  const router = useRouter()
  const [isAddingTicket, setIsAddingTicket] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketForm, setTicketForm] = useState({
    facility: '',
    ticket_number: '',
    net_tons: '',
    ticket_datetime: new Date().toISOString().slice(0, 16),
  })

  // Calculate totals
  const totalTons = dumpTickets.reduce((sum, t) => sum + Number(t.net_tons), 0)
  const overageTons = Math.max(0, totalTons - includedTons)
  const potentialOverageAmount = Math.round(overageTons * overagePerTon)

  // Check if overage adjustment already exists
  const existingOverageAdjustment = adjustments.find(
    (a) => a.kind === 'tonnage_overage' && a.status !== 'void'
  )

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/dump-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility: ticketForm.facility,
          ticket_number: ticketForm.ticket_number,
          net_tons: parseFloat(ticketForm.net_tons),
          ticket_datetime: ticketForm.ticket_datetime,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add dump ticket')
      }

      setIsAddingTicket(false)
      setTicketForm({
        facility: '',
        ticket_number: '',
        net_tons: '',
        ticket_datetime: new Date().toISOString().slice(0, 16),
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdjustment = async () => {
    if (overageTons <= 0) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          customerId,
          kind: 'tonnage_overage',
          amount: potentialOverageAmount,
          notes: `Overage: ${overageTons.toFixed(2)} tons over included ${includedTons} tons`,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create adjustment')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChargeAdjustment = async (adjustmentId: string) => {
    if (!confirm('Are you sure you want to charge this adjustment to the customer\'s saved payment method?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/adjustments/${adjustmentId}/charge`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to charge adjustment')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getAdjustmentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'charged':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'void':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Dump Tickets Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dump Tickets</h2>
          <button
            onClick={() => setIsAddingTicket(true)}
            className="text-sm text-primary-green hover:text-primary-dark-green font-medium"
          >
            + Add Ticket
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Add Ticket Form */}
        {isAddingTicket && (
          <form onSubmit={handleAddTicket} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Facility</label>
                <input
                  type="text"
                  value={ticketForm.facility}
                  onChange={(e) => setTicketForm({ ...ticketForm, facility: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="Landfill name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ticket #</label>
                <input
                  type="text"
                  value={ticketForm.ticket_number}
                  onChange={(e) => setTicketForm({ ...ticketForm, ticket_number: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="123456"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Net Tons</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={ticketForm.net_tons}
                  onChange={(e) => setTicketForm({ ...ticketForm, net_tons: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  placeholder="2.50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date/Time</label>
                <input
                  type="datetime-local"
                  value={ticketForm.ticket_datetime}
                  onChange={(e) => setTicketForm({ ...ticketForm, ticket_datetime: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddingTicket(false)}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-primary-green text-white rounded-lg hover:bg-primary-dark-green disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Ticket'}
              </button>
            </div>
          </form>
        )}

        {/* Tickets List */}
        {dumpTickets.length === 0 ? (
          <p className="text-gray-500 text-sm">No dump tickets recorded</p>
        ) : (
          <div className="space-y-2">
            {dumpTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{ticket.facility}</p>
                  <p className="text-xs text-gray-500">
                    Ticket #{ticket.ticket_number} - {formatDateTime(ticket.ticket_datetime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{Number(ticket.net_tons).toFixed(2)} tons</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Weight Summary */}
        {dumpTickets.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Total Weight</span>
              <span className="font-medium">{totalTons.toFixed(2)} tons</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Included</span>
              <span className="font-medium">{includedTons} tons</span>
            </div>
            {overageTons > 0 && (
              <div className="flex justify-between text-sm text-red-600 font-medium">
                <span>Overage</span>
                <span>{overageTons.toFixed(2)} tons ({formatCents(potentialOverageAmount)})</span>
              </div>
            )}
          </div>
        )}

        {/* Create Overage Adjustment */}
        {overageTons > 0 && !existingOverageAdjustment && (
          <div className="mt-4">
            <button
              onClick={handleCreateAdjustment}
              disabled={loading}
              className="w-full py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Create Overage Adjustment ({formatCents(potentialOverageAmount)})
            </button>
          </div>
        )}
      </div>

      {/* Adjustments Section */}
      {adjustments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Adjustments</h2>
          <div className="space-y-3">
            {adjustments.map((adjustment) => (
              <div key={adjustment.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium capitalize">
                      {adjustment.kind.replace(/_/g, ' ')}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getAdjustmentStatusBadge(adjustment.status)}`}>
                      {adjustment.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-lg font-bold">{formatCents(adjustment.amount)}</span>
                </div>
                {adjustment.notes && (
                  <p className="text-xs text-gray-500 mb-2">{adjustment.notes}</p>
                )}
                {adjustment.status === 'pending' && (
                  <div className="flex gap-2">
                    {hasPaymentMethod ? (
                      <button
                        onClick={() => handleChargeAdjustment(adjustment.id)}
                        disabled={loading}
                        className="px-3 py-1.5 text-sm bg-primary-green text-white rounded-lg hover:bg-primary-dark-green disabled:opacity-50"
                      >
                        {loading ? 'Charging...' : 'Charge Card'}
                      </button>
                    ) : (
                      <p className="text-xs text-red-600">
                        No payment method on file. Customer needs to update their payment info.
                      </p>
                    )}
                  </div>
                )}
                {adjustment.status === 'charged' && (
                  <p className="text-xs text-green-600">Successfully charged on {formatDateTime(adjustment.created_at)}</p>
                )}
                {adjustment.status === 'failed' && (
                  <p className="text-xs text-red-600">Charge failed. Try again or contact customer.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

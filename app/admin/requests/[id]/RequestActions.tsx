'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RequestActionsProps {
  requestId: string
  quoteId: string
  customerId: string
}

export function RequestActions({ requestId, quoteId, customerId }: RequestActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    if (!confirm('Approve this booking request? This will create an invoice and send a payment link to the customer.')) {
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!data.ok) {
        setError(data.error || 'Failed to approve request')
        return
      }

      router.refresh()
    } catch (err) {
      console.error('Error approving request:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsApproving(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/requests/${requestId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      })

      const data = await response.json()

      if (!data.ok) {
        setError(data.error || 'Failed to decline request')
        return
      }

      setShowDeclineModal(false)
      router.refresh()
    } catch (err) {
      console.error('Error declining request:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsDeclining(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isApproving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve & Send Invoice
              </>
            )}
          </button>

          <button
            onClick={() => setShowDeclineModal(true)}
            disabled={isDeclining}
            className="w-full py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Decline Request
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Approving will create an invoice and email the customer a payment link.
        </p>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Decline Request</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Provide a reason for declining this request..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be included in the email to the customer.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                disabled={isDeclining}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isDeclining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Declining...
                  </>
                ) : (
                  'Confirm Decline'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

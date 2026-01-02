'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Dumpster {
  id: string
  unit_number: string
  size: number
}

interface BookingActionsProps {
  bookingId: string
  currentStatus: string
  currentDumpsterId?: string
  availableDumpsters: Dumpster[]
}

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; color: string }[]> = {
  confirmed: [
    { next: 'scheduled', label: 'Mark as Scheduled', color: 'bg-purple-600 hover:bg-purple-700' },
    { next: 'cancelled', label: 'Cancel Booking', color: 'bg-red-600 hover:bg-red-700' },
  ],
  scheduled: [
    { next: 'dropped', label: 'Mark as Dropped', color: 'bg-yellow-600 hover:bg-yellow-700' },
    { next: 'cancelled', label: 'Cancel Booking', color: 'bg-red-600 hover:bg-red-700' },
  ],
  dropped: [
    { next: 'picked_up', label: 'Mark as Picked Up', color: 'bg-green-600 hover:bg-green-700' },
  ],
  picked_up: [
    { next: 'completed', label: 'Mark as Completed', color: 'bg-gray-600 hover:bg-gray-700' },
  ],
  completed: [],
  cancelled: [],
}

export function BookingActions({
  bookingId,
  currentStatus,
  currentDumpsterId,
  availableDumpsters,
}: BookingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDumpsterId, setSelectedDumpsterId] = useState(currentDumpsterId || '')

  const transitions = STATUS_TRANSITIONS[currentStatus] || []

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update status')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignDumpster = async () => {
    if (!selectedDumpsterId) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/assign-dumpster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dumpsterId: selectedDumpsterId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to assign dumpster')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Actions</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Assign Dumpster */}
      {!currentDumpsterId && availableDumpsters.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Dumpster
          </label>
          <div className="flex gap-2">
            <select
              value={selectedDumpsterId}
              onChange={(e) => setSelectedDumpsterId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              disabled={loading}
            >
              <option value="">Select a dumpster...</option>
              {availableDumpsters.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.unit_number} ({d.size} Yard)
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignDumpster}
              disabled={loading || !selectedDumpsterId}
              className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-dark-green disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>
      )}

      {availableDumpsters.length === 0 && !currentDumpsterId && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            No available dumpsters of this size. Check the Dumpsters page.
          </p>
        </div>
      )}

      {/* Status Transitions */}
      {transitions.length > 0 ? (
        <div className="space-y-3">
          {transitions.map((transition) => (
            <button
              key={transition.next}
              onClick={() => handleStatusChange(transition.next)}
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-medium rounded-lg transition ${transition.color} disabled:opacity-50`}
            >
              {loading ? 'Processing...' : transition.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">
          {currentStatus === 'completed'
            ? 'This booking is complete.'
            : currentStatus === 'cancelled'
            ? 'This booking was cancelled.'
            : 'No actions available.'}
        </p>
      )}
    </div>
  )
}

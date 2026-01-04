'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ReportStats {
  totalInvoices: number
  totalRevenue: number
  paidCount: number
  unpaidCount: number
  voidCount: number
  refundedCount: number
}

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function getDefaultStartDate(): string {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().split('T')[0]
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'void', label: 'Void' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'partial', label: 'Partial' },
]

export default function InvoiceReportingPage() {
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getDefaultEndDate())
  const [status, setStatus] = useState('all')
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Fetch stats when filters change
  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          startDate,
          endDate,
          status,
        })
        const response = await fetch(`/api/admin/invoices/stats?${params}`)
        const data = await response.json()
        if (data.ok) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (startDate && endDate) {
      fetchStats()
    }
  }, [startDate, endDate, status])

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        status,
      })

      const response = await fetch(`/api/admin/invoices/export?${params}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoices_${startDate}_to_${endDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/invoices"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Invoice Reporting</h1>
            <p className="text-sm text-gray-500">Export invoice data to Excel</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Report Filters</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-2">Quick select:</span>
              <button
                onClick={() => {
                  const today = new Date()
                  const start = new Date(today.getFullYear(), today.getMonth(), 1)
                  setStartDate(start.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                This Month
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                  const end = new Date(today.getFullYear(), today.getMonth(), 0)
                  setStartDate(start.toISOString().split('T')[0])
                  setEndDate(end.toISOString().split('T')[0])
                }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                Last Month
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const start = new Date(today.getFullYear(), 0, 1)
                  setStartDate(start.toISOString().split('T')[0])
                  setEndDate(today.toISOString().split('T')[0])
                }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                This Year
              </button>
              <button
                onClick={() => {
                  const today = new Date()
                  const start = new Date(today.getFullYear() - 1, 0, 1)
                  const end = new Date(today.getFullYear() - 1, 11, 31)
                  setStartDate(start.toISOString().split('T')[0])
                  setEndDate(end.toISOString().split('T')[0])
                }}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                Last Year
              </button>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Export Report</h2>
            <p className="text-gray-600 mb-4">
              Download a spreadsheet containing all invoices matching your selected filters.
              The report includes customer details, service information, and payment status.
            </p>
            <button
              onClick={handleDownload}
              disabled={isDownloading || !stats || stats.totalInvoices === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition
                ${isDownloading || !stats || stats.totalInvoices === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-green text-white hover:bg-primary-dark-green'
                }
              `}
            >
              {isDownloading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Excel Report
                </>
              )}
            </button>
            {stats && stats.totalInvoices === 0 && (
              <p className="text-sm text-yellow-600 mt-2">
                No invoices found for the selected date range and status.
              </p>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary-green rounded-full animate-spin" />
              </div>
            ) : stats ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Invoices</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInvoices}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">{formatCents(stats.totalRevenue)}</p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">By Status</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Paid</span>
                      <span className="font-medium text-green-600">{stats.paidCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Unpaid</span>
                      <span className="font-medium text-yellow-600">{stats.unpaidCount}</span>
                    </div>
                    {stats.voidCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Void</span>
                        <span className="font-medium text-gray-600">{stats.voidCount}</span>
                      </div>
                    )}
                    {stats.refundedCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Refunded</span>
                        <span className="font-medium text-red-600">{stats.refundedCount}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a date range to see summary
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

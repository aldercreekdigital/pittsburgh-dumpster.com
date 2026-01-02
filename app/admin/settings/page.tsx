'use client'

import { useState, useEffect } from 'react'

interface BusinessSettings {
  quote_expiration_days: number
  notification_emails: string[]
  terms_text: string
  default_included_days: number
}

interface PricingRule {
  id: string
  waste_type: string
  dumpster_size: number
  base_price: number
  delivery_fee: number
  haul_fee: number
  included_days: number
  extra_day_fee: number
  included_tons: number
  overage_per_ton: number
  active: boolean
}

const WASTE_TYPE_LABELS: Record<string, string> = {
  household_trash: 'Household Trash',
  construction_debris: 'Construction Debris',
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2)
}

function parseCents(dollars: string): number {
  return Math.round(parseFloat(dollars || '0') * 100)
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPricing, setSavingPricing] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<PricingRule>>({})

  useEffect(() => {
    fetchSettings()
    fetchPricingRules()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  async function fetchPricingRules() {
    try {
      const res = await fetch('/api/admin/pricing-rules')
      if (!res.ok) throw new Error('Failed to fetch pricing rules')
      const data = await res.json()
      setPricingRules(data)
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
    }
  }

  async function saveSettings() {
    if (!settings) return

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error('Failed to save settings')

      const data = await res.json()
      setSettings(data)
      setMessage({ type: 'success', text: 'Settings saved successfully' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  async function savePricingRule(ruleId: string) {
    setSavingPricing(ruleId)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/pricing-rules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, ...editValues }),
      })

      if (!res.ok) throw new Error('Failed to save pricing rule')

      const updatedRule = await res.json()
      setPricingRules(pricingRules.map((r) => (r.id === ruleId ? updatedRule : r)))
      setEditingRule(null)
      setEditValues({})
      setMessage({ type: 'success', text: 'Pricing updated successfully' })
    } catch (error) {
      console.error('Error saving pricing rule:', error)
      setMessage({ type: 'error', text: 'Failed to save pricing rule' })
    } finally {
      setSavingPricing(null)
    }
  }

  function startEditing(rule: PricingRule) {
    setEditingRule(rule.id)
    setEditValues({
      base_price: rule.base_price,
      delivery_fee: rule.delivery_fee,
      haul_fee: rule.haul_fee,
      included_days: rule.included_days,
      extra_day_fee: rule.extra_day_fee,
      included_tons: rule.included_tons,
      overage_per_ton: rule.overage_per_ton,
    })
  }

  function cancelEditing() {
    setEditingRule(null)
    setEditValues({})
  }

  function addEmail() {
    if (!settings || !newEmail.trim()) return
    if (!newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }
    if (settings.notification_emails.includes(newEmail.trim())) {
      setMessage({ type: 'error', text: 'Email already exists' })
      return
    }
    setSettings({
      ...settings,
      notification_emails: [...settings.notification_emails, newEmail.trim()],
    })
    setNewEmail('')
    setMessage(null)
  }

  function removeEmail(email: string) {
    if (!settings) return
    setSettings({
      ...settings,
      notification_emails: settings.notification_emails.filter((e) => e !== email),
    })
  }

  // Group pricing rules by waste type
  const rulesByWasteType = pricingRules.reduce(
    (acc, rule) => {
      if (!acc[rule.waste_type]) {
        acc[rule.waste_type] = []
      }
      acc[rule.waste_type].push(rule)
      return acc
    },
    {} as Record<string, PricingRule[]>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load settings. Please refresh the page.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Business Settings</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Pricing Rules */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pricing by Dumpster Size</h2>
          <p className="text-sm text-gray-500 mb-6">
            Configure base prices, fees, and overage rates for each dumpster size and waste type.
            Changes only affect new quotes.
          </p>

          {Object.entries(rulesByWasteType).map(([wasteType, rules]) => (
            <div key={wasteType} className="mb-8 last:mb-0">
              <h3 className="text-md font-medium text-gray-700 mb-3">
                {WASTE_TYPE_LABELS[wasteType] || wasteType}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-3 font-medium">Size</th>
                      <th className="text-right py-2 px-3 font-medium">Base Price</th>
                      <th className="text-right py-2 px-3 font-medium">Delivery</th>
                      <th className="text-right py-2 px-3 font-medium">Haul</th>
                      <th className="text-right py-2 px-3 font-medium">Incl. Days</th>
                      <th className="text-right py-2 px-3 font-medium">Extra Day</th>
                      <th className="text-right py-2 px-3 font-medium">Incl. Tons</th>
                      <th className="text-right py-2 px-3 font-medium">Overage/Ton</th>
                      <th className="text-right py-2 px-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-gray-50">
                        {editingRule === rule.id ? (
                          <>
                            <td className="py-2 px-3 font-medium">{rule.dumpster_size} Yard</td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={formatCents(editValues.base_price || 0)}
                                onChange={(e) => setEditValues({ ...editValues, base_price: parseCents(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={formatCents(editValues.delivery_fee || 0)}
                                onChange={(e) => setEditValues({ ...editValues, delivery_fee: parseCents(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={formatCents(editValues.haul_fee || 0)}
                                onChange={(e) => setEditValues({ ...editValues, haul_fee: parseCents(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={editValues.included_days || 0}
                                onChange={(e) => setEditValues({ ...editValues, included_days: parseInt(e.target.value) || 0 })}
                                className="w-16 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={formatCents(editValues.extra_day_fee || 0)}
                                onChange={(e) => setEditValues({ ...editValues, extra_day_fee: parseCents(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.1"
                                value={editValues.included_tons || 0}
                                onChange={(e) => setEditValues({ ...editValues, included_tons: parseFloat(e.target.value) || 0 })}
                                className="w-16 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={formatCents(editValues.overage_per_ton || 0)}
                                onChange={(e) => setEditValues({ ...editValues, overage_per_ton: parseCents(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded text-right"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => savePricingRule(rule.id)}
                                disabled={savingPricing === rule.id}
                                className="text-green-600 hover:text-green-800 mr-2 disabled:opacity-50"
                              >
                                {savingPricing === rule.id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-2 px-3 font-medium">{rule.dumpster_size} Yard</td>
                            <td className="py-2 px-3 text-right">${formatCents(rule.base_price)}</td>
                            <td className="py-2 px-3 text-right">${formatCents(rule.delivery_fee)}</td>
                            <td className="py-2 px-3 text-right">${formatCents(rule.haul_fee)}</td>
                            <td className="py-2 px-3 text-right">{rule.included_days}</td>
                            <td className="py-2 px-3 text-right">${formatCents(rule.extra_day_fee)}</td>
                            <td className="py-2 px-3 text-right">{rule.included_tons}</td>
                            <td className="py-2 px-3 text-right">${formatCents(rule.overage_per_ton)}</td>
                            <td className="py-2 px-3 text-right">
                              <button
                                onClick={() => startEditing(rule)}
                                className="text-primary-green hover:text-primary-green/80"
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {pricingRules.length === 0 && (
            <p className="text-gray-400 italic text-center py-4">No pricing rules configured</p>
          )}
        </div>

        {/* Quote Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quote Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Expiration (days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={settings.quote_expiration_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    quote_expiration_days: parseInt(e.target.value) || 7,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of days before quotes expire
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Included Days
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.default_included_days}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_included_days: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Default rental days included in base price
              </p>
            </div>
          </div>
        </div>

        {/* Notification Emails */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Notification Emails</h2>
          <p className="text-sm text-gray-500 mb-4">
            These email addresses will receive notifications for new booking requests,
            payments, and other important events.
          </p>

          <div className="space-y-3 mb-4">
            {settings.notification_emails.length === 0 ? (
              <p className="text-gray-400 italic">No notification emails configured</p>
            ) : (
              settings.notification_emails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span>{email}</span>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Add email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
            />
            <button
              onClick={addEmail}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Terms & Conditions</h2>
          <p className="text-sm text-gray-500 mb-4">
            This text will be displayed to customers during checkout and on quotes.
          </p>
          <textarea
            rows={6}
            value={settings.terms_text}
            onChange={(e) =>
              setSettings({
                ...settings,
                terms_text: e.target.value,
              })
            }
            placeholder="Enter your terms and conditions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Note about pricing changes</p>
              <p className="mt-1">
                Changes to pricing and settings will only affect new quotes and bookings.
                Existing quotes and bookings will retain their original pricing snapshots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

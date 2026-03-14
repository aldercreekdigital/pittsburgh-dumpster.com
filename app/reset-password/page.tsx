'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), [])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const bootstrapSession = async () => {
      setError(null)

      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const tokenHash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type')
      const queryError = url.searchParams.get('error')

      if (queryError === 'invalid_or_expired_link') {
        setError('This password reset link is invalid or has expired. Please request a new one.')
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError && active) {
          setError('This password reset link is invalid or has expired. Please request a new one.')
        }
      } else if (tokenHash && type === 'recovery') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        })

        if (verifyError && active) {
          setError('This password reset link is invalid or has expired. Please request a new one.')
        }
      } else if (url.hash.includes('access_token') && url.hash.includes('refresh_token')) {
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (setSessionError && active) {
            setError('This password reset link is invalid or has expired. Please request a new one.')
          }
        }
      }

      const { data } = await supabase.auth.getSession()

      if (!active) {
        return
      }

      setHasRecoverySession(Boolean(data.session))
      setIsBootstrapping(false)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return
      }

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setHasRecoverySession(Boolean(session))
      }
    })

    bootstrapSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const passwordsMatch = password === confirmPassword
  const hasMinLength = password.length >= MIN_PASSWORD_LENGTH

  const canSubmit =
    !isSubmitting &&
    !isBootstrapping &&
    hasRecoverySession &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    passwordsMatch &&
    hasMinLength

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!hasRecoverySession) {
      setError('Your recovery session is not active. Please request a new password reset link.')
      return
    }

    if (!hasMinLength) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Password updated successfully. You can now sign in with your new password.')
      setPassword('')
      setConfirmPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card-industrial p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Set New Password</h1>
        <p className="text-center text-gray-600 mb-6">Enter your new password below.</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}{' '}
            <Link href="/login" className="font-medium underline">
              Go to login
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full btn-primary py-3 ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

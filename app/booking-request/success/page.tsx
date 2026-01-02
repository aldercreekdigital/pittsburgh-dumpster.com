import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Booking Request Submitted | McCrackan Roll-Off Services',
  description: 'Your dumpster rental booking request has been submitted.',
}

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function BookingRequestSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams
  const requestId = params.id

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white py-12">
        <div className="container-wide text-center">
          <div className="w-20 h-20 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-white mb-4">Request Submitted!</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Thank you for your booking request. We&apos;ll review it and get back to you shortly.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-off-white">
        <div className="container-wide max-w-2xl">
          <div className="card-industrial p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">What happens next?</h2>

            <div className="space-y-6 text-left">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-green font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">We review your request</h3>
                  <p className="text-gray-600">Our team will review your booking request within 1-2 business hours.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-green font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Receive payment link</h3>
                  <p className="text-gray-600">Once approved, you&apos;ll receive an email with a secure payment link.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-green font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Complete payment</h3>
                  <p className="text-gray-600">Complete your payment to confirm the booking.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-green font-bold">4</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delivery scheduled</h3>
                  <p className="text-gray-600">Your dumpster will be delivered on your scheduled date.</p>
                </div>
              </div>
            </div>

            {requestId && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Reference Number:</strong>{' '}
                  <code className="bg-white px-2 py-1 rounded text-xs">{requestId}</code>
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t">
              <p className="text-gray-600 mb-4">Questions? Contact us at:</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:412-965-2791"
                  className="inline-flex items-center justify-center gap-2 text-primary-green font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (412) 965-2791
                </a>
                <a
                  href="mailto:gmurin@icloud.com"
                  className="inline-flex items-center justify-center gap-2 text-primary-green font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  gmurin@icloud.com
                </a>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/" className="btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

import type { Metadata } from 'next';
import QuoteForm from '@/components/QuoteForm/QuoteForm';
import { PHONE_NUMBERS, DUMPSTER_SIZES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Request a Quote | McCrackan Roll-Off Services',
  description:
    'Get a free dumpster rental quote. Fast response, competitive pricing, and same-day delivery available in Western PA, WV & OH.',
};

export default function RequestQuotePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Request a Free Quote</h1>
            <p className="text-xl text-gray-300">
              Fill out the form below and we&apos;ll get back to you within 2 hours during business hours with your custom quote.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <QuoteForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Quote by Phone */}
              <div className="card-industrial p-6">
                <h3 className="text-lg font-bold mb-4">Need a Faster Quote?</h3>
                <p className="text-gray-600 mb-4">
                  Call us directly for immediate pricing and availability.
                </p>
                <a
                  href={`tel:${PHONE_NUMBERS.tracked.website}`}
                  className="btn-primary w-full text-center"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {PHONE_NUMBERS.display}
                </a>
              </div>

              {/* Price Reference */}
              <div className="card-industrial p-6">
                <h3 className="text-lg font-bold mb-4">Price Ranges</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Starting prices for each size (actual price depends on location and materials):
                </p>
                <ul className="space-y-3">
                  {DUMPSTER_SIZES.map((size) => (
                    <li key={size.size} className="flex justify-between items-center">
                      <span className="font-medium">{size.size}</span>
                      <span className="text-accent-orange font-bold">{size.priceRange}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-4">
                  * Prices include delivery, pickup, and disposal within weight limits. Additional fees may apply for overweight, extended rental, or special materials.
                </p>
              </div>

              {/* What's Included */}
              <div className="card-industrial p-6">
                <h3 className="text-lg font-bold mb-4">What&apos;s Included</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Delivery to your location</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Pickup when you&apos;re done</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">Disposal fees (within weight limit)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">7-14 day rental period</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">No hidden fees</span>
                  </li>
                </ul>
              </div>

              {/* Trust Indicators */}
              <div className="card-industrial p-6 bg-primary-dark-green/5">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-primary-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="font-bold">Licensed & Insured</p>
                    <p className="text-sm text-gray-600">For your protection</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <svg className="w-8 h-8 text-primary-green mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold">Quick Response</p>
                    <p className="text-sm text-gray-600">Quotes within 2 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

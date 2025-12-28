import type { Metadata } from 'next';
import Link from 'next/link';
import CTABanner from '@/components/CTABanner/CTABanner';
import { PHONE_NUMBERS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'How It Works | McCrackan Roll-Off Services',
  description:
    'Renting a dumpster is easy! Choose your size, schedule delivery, fill it up, and we haul it away. Same-day delivery available in Western PA, WV & OH.',
};

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">How It Works</h1>
            <p className="text-xl text-gray-300">
              Renting a dumpster has never been easier. Follow our simple 4-step process and get your project done.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="space-y-16">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h2>Get Your Free Quote</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Start by requesting a free, no-obligation quote. Tell us about your project, the dumpster size you need, and your preferred delivery date. Our team will get back to you within 2 hours during business hours.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Online quote form available 24/7</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Transparent pricing with no hidden fees</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Expert guidance on the right size for your project</span>
                  </li>
                </ul>
                <div className="flex flex-wrap gap-4">
                  <Link href="/request-quote" className="btn-primary">
                    Get Your Quote
                  </Link>
                  <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="btn-secondary">
                    Call {PHONE_NUMBERS.display}
                  </a>
                </div>
              </div>
              <div className="card-industrial p-8 bg-primary-dark-green/5">
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-primary-green opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 mt-4">Free quotes within 2 hours</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 card-industrial p-8 bg-primary-dark-green/5">
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-primary-green opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 mt-4">Same-day delivery available</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h2>Schedule Your Delivery</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Once you approve your quote, we&apos;ll schedule your dumpster delivery. We offer flexible scheduling, including same-day delivery when available. You&apos;ll receive a confirmation with your delivery window.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Same-day delivery available (call by 10 AM)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Flexible morning or afternoon delivery windows</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Text/email confirmation with tracking</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h2>We Deliver & Place</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Our experienced drivers will deliver your dumpster and place it exactly where you need it. We&apos;ll make sure it&apos;s positioned for easy access and won&apos;t damage your property.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Professional placement on driveways, lots, or streets</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Wood planks used to protect surfaces when needed</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>You don&apos;t need to be home for delivery</span>
                  </li>
                </ul>
              </div>
              <div className="card-industrial p-8 bg-primary-dark-green/5">
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-primary-green opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="text-gray-600 mt-4">Professional, careful placement</p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 card-industrial p-8 bg-primary-dark-green/5">
                <div className="text-center">
                  <svg className="w-32 h-32 mx-auto text-primary-green opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <p className="text-gray-600 mt-4">Eco-friendly disposal practices</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-accent-orange rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold text-white">4</span>
                  </div>
                  <h2>You Fill, We Haul Away</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Fill your dumpster at your own pace during your rental period. When you&apos;re done, give us a call or schedule pickup online. We&apos;ll come pick it up and handle the disposal responsibly.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>7-14 day rental periods included</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Extensions available if you need more time</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-primary-light mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Environmentally responsible disposal & recycling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <h2 className="text-center mb-12">Tips for a Smooth Rental</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-industrial p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <svg className="w-6 h-6 text-accent-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Before Delivery
              </h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Clear the delivery area of vehicles and debris</li>
                <li>Ensure 60ft overhead clearance for trucks</li>
                <li>Mark preferred placement spot if desired</li>
                <li>Check if you need a permit for street placement</li>
              </ul>
            </div>

            <div className="card-industrial p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <svg className="w-6 h-6 text-accent-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                During Your Rental
              </h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Don&apos;t fill above the top edge of the dumpster</li>
                <li>Distribute weight evenly across the container</li>
                <li>Keep prohibited items out (see our list)</li>
                <li>Call us early if you need an extension</li>
              </ul>
            </div>

            <div className="card-industrial p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center">
                <svg className="w-6 h-6 text-accent-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                For Pickup
              </h3>
              <ul className="text-gray-600 text-sm space-y-2">
                <li>Ensure nothing is sticking out above the sides</li>
                <li>Clear the area around the dumpster</li>
                <li>Close the back door if accessible</li>
                <li>You don&apos;t need to be present for pickup</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to Get Started?"
        subtitle="Get your free quote and schedule your dumpster delivery today. We make it easy!"
      />
    </>
  );
}

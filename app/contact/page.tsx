import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, PHONE_NUMBERS, HOURS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact Us | McCrackan Roll-Off Services',
  description:
    'Contact McCrackan Roll-Off Services for dumpster rental inquiries, quotes, and support. Serving Western PA, WV & OH.',
};

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Contact Us</h1>
            <p className="text-xl text-gray-300">
              Have questions? Need a quote? We&apos;re here to help. Reach out to our team and we&apos;ll get back to you promptly.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="mb-8">Get in Touch</h2>

              {/* Phone */}
              <div className="card-industrial p-6 mb-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent-orange/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Phone</h3>
                    <a
                      href={`tel:${PHONE_NUMBERS.tracked.website}`}
                      className="text-xl text-accent-orange font-bold hover:underline"
                    >
                      {PHONE_NUMBERS.display}
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      Call us for immediate quotes and scheduling
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="card-industrial p-6 mb-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-light/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Email</h3>
                    <a
                      href={`mailto:${BUSINESS_INFO.email}`}
                      className="text-primary-green font-medium hover:underline"
                    >
                      {BUSINESS_INFO.email}
                    </a>
                    <p className="text-gray-600 text-sm mt-1">
                      We typically respond within 2 hours during business hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="card-industrial p-6 mb-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-light/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">Office Location</h3>
                    <address className="not-italic text-gray-700">
                      {BUSINESS_INFO.address.street}
                      <br />
                      {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state} {BUSINESS_INFO.address.zip}
                    </address>
                    <p className="text-gray-600 text-sm mt-1">
                      Note: This is an office location, not a public drop-off site
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="card-industrial p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary-light/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Hours of Operation</h3>
                    <ul className="space-y-1 text-gray-700">
                      <li className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="font-medium">{HOURS.weekdays}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-medium">{HOURS.saturday}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-medium">{HOURS.sunday}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="card-industrial p-6 md:p-8">
                <h2 className="mb-6">Send Us a Message</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                        placeholder="(412) 555-1234"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                    >
                      <option value="">Select a topic...</option>
                      <option value="quote">Request a Quote</option>
                      <option value="scheduling">Scheduling Question</option>
                      <option value="billing">Billing Inquiry</option>
                      <option value="service">Service Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We respect your privacy and will never share your information.
                  </p>
                </form>
              </div>

              {/* Quick Quote Link */}
              <div className="mt-6 p-6 bg-accent-orange/10 rounded-xl text-center">
                <p className="font-medium mb-2">Need a dumpster rental quote?</p>
                <Link href="/request-quote" className="btn-primary">
                  Get Your Free Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="card-industrial p-8">
            <h2 className="text-center mb-8">Service Area</h2>
            <div className="h-80 bg-light-gray rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-steel-gray opacity-50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600">Serving Western PA, Northern WV & Eastern OH</p>
                <Link href="/service-area" className="text-primary-green hover:underline mt-2 inline-block">
                  View our full service area →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

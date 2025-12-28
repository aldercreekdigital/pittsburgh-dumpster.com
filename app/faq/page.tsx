'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import CTABanner from '@/components/CTABanner/CTABanner';
import { FAQ_ITEMS, PROHIBITED_ITEMS, PHONE_NUMBERS } from '@/lib/constants';

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:text-primary-green transition"
      >
        <span className="font-medium pr-4">{question}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-300">
              Find answers to common questions about our dumpster rental services.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ List */}
            <div className="lg:col-span-2 space-y-8">
              {FAQ_ITEMS.map((category, categoryIndex) => (
                <div key={categoryIndex} className="card-industrial p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <span className="w-8 h-8 bg-primary-light/10 rounded-full flex items-center justify-center mr-3 text-sm text-primary-green">
                      {categoryIndex + 1}
                    </span>
                    {category.category}
                  </h2>
                  <div>
                    {category.questions.map((item, itemIndex) => (
                      <FAQItem key={itemIndex} question={item.question} answer={item.answer} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <div className="card-industrial p-6">
                <h3 className="text-lg font-bold mb-4">Still Have Questions?</h3>
                <p className="text-gray-600 mb-4">
                  Our team is here to help! Give us a call or send us a message.
                </p>
                <div className="space-y-3">
                  <a
                    href={`tel:${PHONE_NUMBERS.tracked.website}`}
                    className="flex items-center text-accent-orange font-bold hover:underline"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {PHONE_NUMBERS.display}
                  </a>
                  <Link
                    href="/contact"
                    className="flex items-center text-primary-green font-medium hover:underline"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact Us Online
                  </Link>
                </div>
              </div>

              {/* Prohibited Items */}
              <div className="card-industrial p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <svg className="w-5 h-5 text-accent-red mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Prohibited Items
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  The following items cannot be placed in our dumpsters:
                </p>
                <ul className="space-y-1 text-sm">
                  {PROHIBITED_ITEMS.slice(0, 8).map((item, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 text-accent-red mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/dumpster-sizes" className="text-sm text-primary-green hover:underline mt-3 inline-block">
                  View complete list →
                </Link>
              </div>

              {/* Quick Links */}
              <div className="card-industrial p-6">
                <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/dumpster-sizes" className="text-gray-600 hover:text-primary-green transition">
                      Dumpster Sizes & Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="text-gray-600 hover:text-primary-green transition">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/service-area" className="text-gray-600 hover:text-primary-green transition">
                      Service Area
                    </Link>
                  </li>
                  <li>
                    <Link href="/request-quote" className="text-gray-600 hover:text-primary-green transition">
                      Request a Quote
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to Get Started?"
        subtitle="Get a free quote for your dumpster rental today. We're here to help!"
      />
    </>
  );
}

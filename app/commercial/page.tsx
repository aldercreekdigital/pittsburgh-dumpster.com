import type { Metadata } from 'next';
import Link from 'next/link';
import CTABanner from '@/components/CTABanner/CTABanner';
import { PHONE_NUMBERS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Commercial Dumpster Rental | McCrackan Roll-Off Services',
  description:
    'Commercial dumpster rental for businesses, retail, offices, and warehouses. Flexible scheduling, competitive rates, and reliable service in Western PA, WV & OH.',
};

const commercialServices = [
  {
    title: 'Office Renovations',
    description: 'Modernize your workspace with efficient debris removal for remodels, updates, and expansions.',
  },
  {
    title: 'Retail Store Cleanouts',
    description: 'Quick turnaround for store closings, inventory clearance, and renovation projects.',
  },
  {
    title: 'Warehouse Cleanups',
    description: 'Large-scale debris removal for warehouse reorganization and inventory disposal.',
  },
  {
    title: 'Property Management',
    description: 'Reliable service for apartment turnovers, building maintenance, and property cleanouts.',
  },
  {
    title: 'Restaurant Renovations',
    description: 'Fast, flexible service to minimize downtime during restaurant updates and remodels.',
  },
  {
    title: 'Healthcare Facilities',
    description: 'Compliant waste disposal for medical office renovations and non-hazardous cleanouts.',
  },
];

const benefits = [
  {
    title: 'Flexible Scheduling',
    description: 'We work around your business hours to minimize disruption.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Volume Discounts',
    description: 'Save money with competitive pricing for ongoing or multi-container needs.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Dedicated Account Support',
    description: 'A single point of contact for all your dumpster rental needs.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Fast Turnaround',
    description: 'Same-day delivery and pickup available to keep your project on schedule.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export default function CommercialPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Commercial Dumpster Rental</h1>
            <p className="text-xl text-gray-300 mb-6">
              Keep your business running smoothly with reliable, flexible dumpster rental services designed for commercial needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/request-quote" className="btn-primary">
                Get Commercial Quote
              </Link>
              <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="btn-secondary">
                Call for Volume Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Businesses Choose Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We understand the unique needs of commercial clients and provide tailored solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="card-industrial p-6 text-center">
                <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-green">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Services */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Commercial Services We Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From small office cleanouts to large warehouse operations, we have you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {commercialServices.map((service, index) => (
              <div key={index} className="card-industrial p-6">
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Sizes */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Dumpster Sizes for Commercial Projects</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer the full range of sizes to meet any commercial need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card-industrial p-6">
              <h3 className="text-xl font-bold mb-4">Small to Medium Projects</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center p-3 bg-light-gray rounded-lg">
                  <span className="font-medium">10 Yard</span>
                  <span className="text-gray-600">Office cleanouts, small renovations</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-light-gray rounded-lg">
                  <span className="font-medium">20 Yard</span>
                  <span className="text-gray-600">Store renovations, large cleanouts</span>
                </li>
              </ul>
            </div>
            <div className="card-industrial p-6">
              <h3 className="text-xl font-bold mb-4">Large Projects</h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center p-3 bg-light-gray rounded-lg">
                  <span className="font-medium">30 Yard</span>
                  <span className="text-gray-600">Major renovations, warehouse cleanouts</span>
                </li>
                <li className="flex justify-between items-center p-3 bg-light-gray rounded-lg">
                  <span className="font-medium">40 Yard</span>
                  <span className="text-gray-600">Large commercial, industrial projects</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/dumpster-sizes" className="btn-secondary">
              View Detailed Size Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Business Account */}
      <section className="section-padding bg-primary-dark-green text-white">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-white mb-4">Open a Business Account</h2>
              <p className="text-gray-300 mb-6">
                Streamline your waste management with a McCrackan business account. Enjoy priority scheduling, volume discounts, and dedicated support.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent-orange mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority scheduling and delivery
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent-orange mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Volume-based pricing discounts
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent-orange mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Net 30 payment terms available
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent-orange mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dedicated account manager
                </li>
              </ul>
              <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="btn-primary">
                Call to Set Up Account
              </a>
            </div>
            <div className="card-industrial p-8 bg-white/10 border-white/20">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto text-white/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-xl font-bold mb-2">Trusted by Local Businesses</p>
                <p className="text-gray-300">Property managers, contractors, and businesses across the tri-state area rely on McCrackan for their dumpster needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to Discuss Your Commercial Needs?"
        subtitle="Contact us for custom pricing and flexible scheduling tailored to your business."
      />
    </>
  );
}

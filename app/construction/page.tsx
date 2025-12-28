import type { Metadata } from 'next';
import Link from 'next/link';
import CTABanner from '@/components/CTABanner/CTABanner';
import { DUMPSTER_SIZES, PHONE_NUMBERS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Construction Dumpster Rental | McCrackan Roll-Off Services',
  description:
    'Heavy-duty construction dumpsters for contractors and builders. 10-40 yard containers, flexible terms, and reliable delivery in Western PA, WV & OH.',
};

const constructionProjects = [
  {
    title: 'New Construction',
    description: 'Keep your job site clean with reliable debris removal throughout the build process.',
    sizes: '30-40 Yard',
  },
  {
    title: 'Demolition',
    description: 'Heavy-duty containers rated for concrete, brick, and demolition debris.',
    sizes: '30-40 Yard',
  },
  {
    title: 'Roofing',
    description: 'Dedicated roofing dumpsters with weight limits designed for shingle disposal.',
    sizes: '20 Yard',
  },
  {
    title: 'Remodeling',
    description: 'Right-sized containers for kitchen, bathroom, and whole-home renovation projects.',
    sizes: '10-20 Yard',
  },
  {
    title: 'Excavation',
    description: 'Containers for dirt, rock, and excavation materials with appropriate weight ratings.',
    sizes: '10-20 Yard',
  },
  {
    title: 'Landscaping',
    description: 'Dispose of trees, brush, sod, and landscaping debris efficiently.',
    sizes: '10-20 Yard',
  },
];

export default function ConstructionPage() {
  const constructionSizes = DUMPSTER_SIZES.filter((d) => ['30 Yard', '40 Yard'].includes(d.size));

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Construction Dumpster Rental</h1>
            <p className="text-xl text-gray-300 mb-6">
              Heavy-duty roll-off containers built for the demands of construction sites. Reliable delivery, flexible terms, and contractor-friendly service.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Same-Day Delivery
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Contractor Pricing
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Flexible Rental Terms
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/request-quote" className="btn-primary">
                Get Contractor Quote
              </Link>
              <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="btn-secondary">
                Call {PHONE_NUMBERS.display}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Construction Projects We Support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From residential builds to commercial demolition, we have the equipment and expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {constructionProjects.map((project, index) => (
              <div key={index} className="card-industrial p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <p className="text-sm">
                  <span className="text-gray-500">Recommended: </span>
                  <span className="font-bold text-accent-orange">{project.sizes}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Container Focus */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Heavy-Duty Containers for Construction</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our 30 and 40 yard dumpsters are built for the demands of construction work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {constructionSizes.map((dumpster) => (
              <div key={dumpster.size} className="card-industrial p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{dumpster.size}</h3>
                  <span className="text-2xl font-bold text-accent-orange">{dumpster.priceRange}</span>
                </div>
                <p className="text-gray-500 text-sm mb-4">{dumpster.dimensions}</p>
                <p className="text-gray-600 mb-4">{dumpster.description}</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-primary-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {dumpster.capacity}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-primary-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {dumpster.weight}
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-primary-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {dumpster.rentalPeriod}
                  </li>
                </ul>
                <Link href={`/request-quote?size=${encodeURIComponent(dumpster.size)}`} className="btn-primary w-full text-center">
                  Get Quote for {dumpster.size}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/dumpster-sizes" className="btn-secondary">
              View All Dumpster Sizes
            </Link>
          </div>
        </div>
      </section>

      {/* Contractor Benefits */}
      <section className="section-padding">
        <div className="container-wide">
          <h2 className="text-center mb-12">Why Contractors Choose McCrackan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-industrial p-6 text-center">
              <div className="w-14 h-14 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">On-Time Delivery</h3>
              <p className="text-gray-600 text-sm">We show up when we say we will. Your schedule is our priority.</p>
            </div>

            <div className="card-industrial p-6 text-center">
              <div className="w-14 h-14 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Contractor Rates</h3>
              <p className="text-gray-600 text-sm">Volume discounts and account billing for regular customers.</p>
            </div>

            <div className="card-industrial p-6 text-center">
              <div className="w-14 h-14 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Quick Swaps</h3>
              <p className="text-gray-600 text-sm">Need a full container swapped? We&apos;ll get a new one there fast.</p>
            </div>

            <div className="card-industrial p-6 text-center">
              <div className="w-14 h-14 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Fully Insured</h3>
              <p className="text-gray-600 text-sm">Complete liability coverage for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Heavy Materials Note */}
      <section className="section-padding bg-accent-yellow/10">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-4">Heavy Material Disposal</h2>
            <p className="text-gray-600 mb-6">
              Disposing of concrete, brick, dirt, or other heavy materials? We offer specialized containers with appropriate weight limits. Heavy debris cannot be mixed with general construction waste.
            </p>
            <div className="inline-flex items-center text-steel-gray">
              <svg className="w-5 h-5 mr-2 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Call us for heavy debris pricing and availability
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to Get Started?"
        subtitle="Get contractor pricing for your construction project. Same-day delivery available."
      />
    </>
  );
}

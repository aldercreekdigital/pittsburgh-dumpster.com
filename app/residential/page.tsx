import type { Metadata } from 'next';
import Link from 'next/link';
import CTABanner from '@/components/CTABanner/CTABanner';
import { DUMPSTER_SIZES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Residential Dumpster Rental | McCrackan Roll-Off Services',
  description:
    'Affordable residential dumpster rental for home renovations, cleanouts, landscaping, and more. 10-40 yard containers available with same-day delivery in Western PA.',
};

const residentialProjects = [
  {
    title: 'Home Renovations',
    description: 'Kitchen remodels, bathroom updates, flooring replacements, and whole-home renovations.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    recommendedSize: '20 Yard',
  },
  {
    title: 'Garage & Basement Cleanouts',
    description: 'Clear out years of accumulated items, old furniture, boxes, and household goods.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    recommendedSize: '10-15 Yard',
  },
  {
    title: 'Estate Cleanouts',
    description: 'Complete estate clearing, including furniture, personal items, and household contents.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    recommendedSize: '20-30 Yard',
  },
  {
    title: 'Landscaping Projects',
    description: 'Yard debris, tree trimmings, brush, sod removal, and outdoor renovation waste.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    recommendedSize: '10-20 Yard',
  },
  {
    title: 'Roofing Projects',
    description: 'Shingle removal, roof repairs, and complete re-roofing debris disposal.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    recommendedSize: '20 Yard',
  },
  {
    title: 'Moving & Downsizing',
    description: 'Get rid of unwanted items before a move or when downsizing to a smaller home.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    recommendedSize: '10-15 Yard',
  },
];

export default function ResidentialPage() {
  const recommendedSizes = DUMPSTER_SIZES.filter((d) => ['10 Yard', '20 Yard'].includes(d.size));

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Residential Dumpster Rental</h1>
            <p className="text-xl text-gray-300 mb-6">
              Whether you&apos;re tackling a home renovation, cleaning out the garage, or landscaping your yard, we have the perfect dumpster for your project.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Driveway-Friendly Delivery
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Flexible Rental Periods
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm">
                <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Same-Day Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Popular Residential Projects</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We help homeowners with all types of projects. Here are some of the most common.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {residentialProjects.map((project, index) => (
              <div key={index} className="card-industrial p-6">
                <div className="w-14 h-14 bg-primary-light/10 rounded-full flex items-center justify-center mb-4 text-primary-green">
                  {project.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <p className="text-sm">
                  <span className="text-gray-500">Recommended: </span>
                  <span className="font-bold text-accent-orange">{project.recommendedSize}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Sizes */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Recommended Sizes for Homeowners</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our 10 and 20 yard dumpsters are the most popular choices for residential projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {recommendedSizes.map((dumpster) => (
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

      {/* Tips for Homeowners */}
      <section className="section-padding">
        <div className="container-wide">
          <h2 className="text-center mb-12">Tips for Homeowners</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card-industrial p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <svg className="w-6 h-6 text-accent-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Choosing the Right Size
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>When in doubt, go one size up - it&apos;s cheaper than ordering a second dumpster</li>
                <li>Consider the weight of materials, not just volume</li>
                <li>Roofing and concrete are heavy - check weight limits</li>
                <li>Call us for free sizing advice - we&apos;re happy to help!</li>
              </ul>
            </div>

            <div className="card-industrial p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <svg className="w-6 h-6 text-accent-orange mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Placement Tips
              </h3>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li>Clear the driveway before delivery</li>
                <li>We can place boards to protect your driveway</li>
                <li>Street placement may require a permit</li>
                <li>Ensure 60ft overhead clearance for our trucks</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to Start Your Project?"
        subtitle="Get a free quote for residential dumpster rental. Same-day delivery available!"
      />
    </>
  );
}

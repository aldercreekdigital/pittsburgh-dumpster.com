import type { Metadata } from 'next';
import Link from 'next/link';
import ServiceAreaMap from '@/components/ServiceAreaMap/ServiceAreaMap';
import CTABanner from '@/components/CTABanner/CTABanner';
import { SERVICE_AREAS, PHONE_NUMBERS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Service Area | Dumpster Rental in Western PA, WV & OH | McCrackan Roll-Off',
  description:
    'We serve over 50 counties across Western Pennsylvania, Northern West Virginia, and Eastern Ohio. Same-day dumpster delivery available in Pittsburgh and surrounding areas.',
};

export default function ServiceAreaPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Our Service Area</h1>
            <p className="text-xl text-gray-300">
              Proudly serving over 50 counties across Western Pennsylvania, Northern West Virginia, and Eastern Ohio.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="section-padding">
        <div className="container-wide">
          <ServiceAreaMap showFullDetails={true} height="h-80 md:h-96 lg:h-[500px]" />
        </div>
      </section>

      {/* Detailed County Lists */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <h2 className="text-center mb-12">Counties We Serve</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pennsylvania */}
            <div className="card-industrial p-6">
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-primary-green rounded-full mr-3"></div>
                <h3 className="text-xl">{SERVICE_AREAS.pennsylvania.name}</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Our primary service area with same-day delivery available in most locations.</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_AREAS.pennsylvania.counties.map((county) => (
                  <div key={county} className="text-sm text-gray-700 flex items-center">
                    <svg className="w-4 h-4 text-primary-light mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {county}
                  </div>
                ))}
              </div>
            </div>

            {/* West Virginia */}
            <div className="card-industrial p-6">
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-accent-orange rounded-full mr-3"></div>
                <h3 className="text-xl">{SERVICE_AREAS.westVirginia.name}</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Serving the Northern Panhandle with next-day delivery typically available.</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_AREAS.westVirginia.counties.map((county) => (
                  <div key={county} className="text-sm text-gray-700 flex items-center">
                    <svg className="w-4 h-4 text-primary-light mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {county}
                  </div>
                ))}
              </div>
            </div>

            {/* Ohio */}
            <div className="card-industrial p-6">
              <div className="flex items-center mb-4">
                <div className="w-4 h-4 bg-accent-blue rounded-full mr-3"></div>
                <h3 className="text-xl">{SERVICE_AREAS.ohio.name}</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">Serving the Ohio Valley and Mahoning Valley regions.</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_AREAS.ohio.counties.map((county) => (
                  <div key={county} className="text-sm text-gray-700 flex items-center">
                    <svg className="w-4 h-4 text-primary-light mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {county}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="section-padding">
        <div className="container-wide">
          <h2 className="text-center mb-12">Popular Cities We Serve</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PA Cities */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <div className="w-3 h-3 bg-primary-green rounded-full mr-2"></div>
                Pennsylvania
              </h3>
              <ul className="space-y-2">
                {SERVICE_AREAS.pennsylvania.cities.map((city) => (
                  <li key={city} className="text-gray-600 hover:text-primary-green transition">
                    <Link href={`/request-quote?city=${encodeURIComponent(city)}`} className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Dumpster Rental in {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* WV Cities */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <div className="w-3 h-3 bg-accent-orange rounded-full mr-2"></div>
                West Virginia
              </h3>
              <ul className="space-y-2">
                {SERVICE_AREAS.westVirginia.cities.map((city) => (
                  <li key={city} className="text-gray-600 hover:text-primary-green transition">
                    <Link href={`/request-quote?city=${encodeURIComponent(city)}`} className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Dumpster Rental in {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* OH Cities */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <div className="w-3 h-3 bg-accent-blue rounded-full mr-2"></div>
                Ohio
              </h3>
              <ul className="space-y-2">
                {SERVICE_AREAS.ohio.cities.map((city) => (
                  <li key={city} className="text-gray-600 hover:text-primary-green transition">
                    <Link href={`/request-quote?city=${encodeURIComponent(city)}`} className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Dumpster Rental in {city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Not Listed */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="card-industrial p-8 text-center max-w-2xl mx-auto">
            <h2 className="mb-4">Don&apos;t See Your Location?</h2>
            <p className="text-gray-600 mb-6">
              We may still be able to serve you! Our service area is always expanding, and we often accommodate deliveries outside our listed areas. Give us a call to check availability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${PHONE_NUMBERS.tracked.website}`}
                className="btn-primary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call {PHONE_NUMBERS.display}
              </a>
              <Link href="/contact" className="btn-secondary">
                Contact Us Online
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Ready to Rent a Dumpster?"
        subtitle="Get a free quote for dumpster rental in your area. Fast delivery, competitive pricing!"
      />
    </>
  );
}

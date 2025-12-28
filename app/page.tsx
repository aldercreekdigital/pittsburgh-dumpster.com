import Link from 'next/link';
import Hero from '@/components/Hero/Hero';
import DumpsterCard from '@/components/DumpsterCard/DumpsterCard';
import ServiceAreaMap from '@/components/ServiceAreaMap/ServiceAreaMap';
import CTABanner from '@/components/CTABanner/CTABanner';
import { DUMPSTER_SIZES, TRUST_INDICATORS } from '@/lib/constants';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Popular Dumpster Sizes */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Choose Your Dumpster Size</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From small cleanouts to major construction projects, we have the right size for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DUMPSTER_SIZES.map((dumpster) => (
              <DumpsterCard key={dumpster.size} {...dumpster} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/dumpster-sizes" className="btn-secondary">
              View All Sizes & Details
            </Link>
          </div>
        </div>
      </section>

      {/* Use Case Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Dumpster Rental for Every Project</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re a homeowner, contractor, or business owner, we have solutions tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Residential */}
            <Link href="/residential" className="card-industrial p-8 text-center group">
              <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-light/20 transition">
                <svg className="w-8 h-8 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl mb-2 group-hover:text-accent-orange transition">Residential</h3>
              <p className="text-gray-600 text-sm">
                Home renovations, garage cleanouts, landscaping debris, estate cleanouts, and more.
              </p>
            </Link>

            {/* Commercial */}
            <Link href="/commercial" className="card-industrial p-8 text-center group">
              <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-light/20 transition">
                <svg className="w-8 h-8 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl mb-2 group-hover:text-accent-orange transition">Commercial</h3>
              <p className="text-gray-600 text-sm">
                Office cleanouts, retail renovations, warehouse debris, and ongoing business waste management.
              </p>
            </Link>

            {/* Construction */}
            <Link href="/construction" className="card-industrial p-8 text-center group">
              <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-light/20 transition">
                <svg className="w-8 h-8 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl mb-2 group-hover:text-accent-orange transition">Construction</h3>
              <p className="text-gray-600 text-sm">
                New builds, demolition, roofing projects, and contractor-friendly rental terms.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-gradient-industrial text-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Getting a dumpster is easy. Just three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl text-white mb-2">Choose Size & Schedule</h3>
              <p className="text-gray-300">
                Select the dumpster size that fits your project and pick your delivery date.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl text-white mb-2">We Deliver & Place</h3>
              <p className="text-gray-300">
                Our team delivers the dumpster and places it exactly where you need it.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-accent-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl text-white mb-2">You Fill, We Haul</h3>
              <p className="text-gray-300">
                Fill it up at your pace. When you&apos;re done, we pick it up and dispose of everything.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/how-it-works" className="btn-primary">
              Learn More About Our Process
            </Link>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Serving Western PA, WV & OH</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We proudly serve over 50 counties across three states.
            </p>
          </div>

          <ServiceAreaMap />
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose McCrackan Roll-Off?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We&apos;re committed to providing the best dumpster rental experience in the region.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_INDICATORS.map((indicator, index) => (
              <div key={index} className="card-industrial p-6 text-center">
                <div className="w-14 h-14 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {indicator.icon === 'shield' && (
                    <svg className="w-7 h-7 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                  {indicator.icon === 'dollar' && (
                    <svg className="w-7 h-7 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {indicator.icon === 'leaf' && (
                    <svg className="w-7 h-7 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                  {indicator.icon === 'heart' && (
                    <svg className="w-7 h-7 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2">{indicator.title}</h3>
                <p className="text-gray-600 text-sm">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <CTABanner />
    </>
  );
}

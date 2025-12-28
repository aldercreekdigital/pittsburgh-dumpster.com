import type { Metadata } from 'next';
import DumpsterCard from '@/components/DumpsterCard/DumpsterCard';
import CTABanner from '@/components/CTABanner/CTABanner';
import { DUMPSTER_SIZES, PROHIBITED_ITEMS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Dumpster Sizes & Pricing | McCrackan Roll-Off Services',
  description:
    'Choose from 10, 20, 30, and 40 yard dumpsters. Competitive pricing with no hidden fees. Same-day delivery available in Western PA, WV & OH.',
};

export default function DumpsterSizesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Dumpster Sizes & Pricing</h1>
            <p className="text-xl text-gray-300">
              Find the perfect dumpster size for your project. From small cleanouts to major construction, we have you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Dumpster Sizes Grid */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DUMPSTER_SIZES.map((dumpster) => (
              <DumpsterCard key={dumpster.size} {...dumpster} />
            ))}
          </div>
        </div>
      </section>

      {/* Size Comparison */}
      <section className="section-padding">
        <div className="container-wide">
          <h2 className="text-center mb-12">Compare Dumpster Sizes</h2>

          <div className="overflow-x-auto">
            <table className="w-full card-industrial">
              <thead className="bg-primary-dark-green text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Size</th>
                  <th className="px-6 py-4 text-left">Dimensions</th>
                  <th className="px-6 py-4 text-left">Capacity</th>
                  <th className="px-6 py-4 text-left">Weight Limit</th>
                  <th className="px-6 py-4 text-left">Rental Period</th>
                  <th className="px-6 py-4 text-left">Price Range</th>
                </tr>
              </thead>
              <tbody>
                {DUMPSTER_SIZES.map((dumpster, index) => (
                  <tr
                    key={dumpster.size}
                    className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                      dumpster.popular ? 'ring-2 ring-inset ring-accent-orange' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-bold">
                      {dumpster.size}
                      {dumpster.popular && (
                        <span className="ml-2 badge badge-popular text-xs">Popular</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{dumpster.dimensions}</td>
                    <td className="px-6 py-4">{dumpster.capacity}</td>
                    <td className="px-6 py-4">{dumpster.weight}</td>
                    <td className="px-6 py-4">{dumpster.rentalPeriod}</td>
                    <td className="px-6 py-4 font-bold text-accent-orange">{dumpster.priceRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What Fits Guide */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <h2 className="text-center mb-12">What Fits in Each Size?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DUMPSTER_SIZES.map((dumpster) => (
              <div key={dumpster.size} className="card-industrial p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-10 h-10 bg-primary-light/10 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-primary-green">
                    {dumpster.size.split(' ')[0]}
                  </span>
                  {dumpster.size} Dumpster
                </h3>
                <p className="text-gray-600 mb-4">{dumpster.description}</p>
                <div>
                  <p className="font-medium text-sm text-gray-500 mb-2">IDEAL FOR:</p>
                  <ul className="space-y-2">
                    {dumpster.idealFor.map((use, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-primary-light mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {use}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prohibited Items */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="card-industrial p-8">
            <h2 className="text-center mb-8">Prohibited Items</h2>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
              For safety and environmental reasons, the following items cannot be placed in our dumpsters.
              Please contact us if you have questions about specific materials.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROHIBITED_ITEMS.map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-accent-red/5 rounded-lg border border-accent-red/20">
                  <svg className="w-5 h-5 text-accent-red mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner
        title="Need Help Choosing?"
        subtitle="Our team can help you select the perfect dumpster size for your project. Get a free quote today!"
      />
    </>
  );
}

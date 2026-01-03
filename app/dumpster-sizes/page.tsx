import type { Metadata } from 'next';
import DumpsterCard from '@/components/DumpsterCard/DumpsterCard';
import CTABanner from '@/components/CTABanner/CTABanner';
import { DumpsterSelector } from '@/components/DumpsterSelector';
import { DUMPSTER_SIZES, DUMPSTER_SIZE_METADATA, PROHIBITED_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { decodeBookingData } from '@/lib/booking/stash';
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Dumpster Sizes & Pricing | McCrackan Roll-Off Services',
  description:
    'Choose from 10, 15, and 20 yard dumpsters. Competitive pricing with no hidden fees. Same-day delivery available in Western PA, WV & OH.',
};

interface PageProps {
  searchParams: Promise<{ data?: string }>;
}

interface DumpsterData {
  size: string
  sizeNum: number
  dimensions: string
  description: string
  priceRange: string
  idealFor: string[]
  capacity: string
  weight: string
  rentalPeriod: string
  popular: boolean
}

interface PricingRule {
  dumpster_size: number
  base_price: number
  included_days: number
  included_tons: string | number
  public_notes: string | null
}

async function getDumpsterSizes(): Promise<DumpsterData[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('pricing_rules')
      .select('dumpster_size, base_price, included_days, included_tons, public_notes')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('active', true)
      .order('dumpster_size', { ascending: true })

    const rules = data as PricingRule[] | null

    if (error || !rules || rules.length === 0) {
      // Fallback to static data
      return DUMPSTER_SIZES.map(d => ({
        ...d,
        sizeNum: parseInt(d.size),
      }))
    }

    // Group by dumpster size and get unique sizes
    const sizeMap = new Map<number, PricingRule>()
    for (const rule of rules) {
      if (!sizeMap.has(rule.dumpster_size)) {
        sizeMap.set(rule.dumpster_size, rule)
      }
    }

    // Build display data from database
    return Array.from(sizeMap.entries()).map(([sizeNum, rule]) => {
      const metadata = DUMPSTER_SIZE_METADATA[sizeNum] || {
        dimensions: "Standard dimensions",
        description: rule.public_notes || 'Professional dumpster rental service.',
        idealFor: ['General cleanup', 'Renovation projects'],
        capacity: 'Multiple pickup truck loads',
        popular: false,
      }

      const priceInDollars = rule.base_price / 100
      const includedTons = Number(rule.included_tons)

      return {
        size: `${sizeNum} Yard`,
        sizeNum,
        dimensions: metadata.dimensions,
        description: rule.public_notes || metadata.description,
        priceRange: `$${priceInDollars}`,
        idealFor: metadata.idealFor,
        capacity: metadata.capacity,
        weight: `${includedTons} ton${includedTons > 1 ? 's' : ''} included`,
        rentalPeriod: `${rule.included_days} days included`,
        popular: metadata.popular,
      }
    })
  } catch (error) {
    console.error('Error fetching dumpster sizes:', error)
    // Fallback to static data
    return DUMPSTER_SIZES.map(d => ({
      ...d,
      sizeNum: parseInt(d.size),
    }))
  }
}

export default async function DumpsterSizesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const encodedData = params.data;

  // If there's stashed booking data, show the booking flow
  if (encodedData) {
    const stashedData = decodeBookingData(encodedData);

    if (!stashedData || !stashedData.address) {
      // Invalid data - redirect to booking
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid booking data</h1>
            <p className="text-gray-600 mb-6">Please start your booking again.</p>
            <Link href="/booking" className="btn-primary">
              Start Booking
            </Link>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Hero Section */}
        <section className="bg-gradient-industrial text-white section-padding">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-white mb-4">Configure Your Rental</h1>
              <p className="text-xl text-gray-300">
                Select your dumpster size and rental dates to see your total price.
              </p>
            </div>
          </div>
        </section>

        {/* Booking Flow */}
        <section className="section-padding bg-off-white">
          <div className="container-wide max-w-3xl">
            <DumpsterSelector stashedAddress={stashedData.address} />
          </div>
        </section>
      </>
    );
  }

  // Fetch live dumpster data
  const dumpsters = await getDumpsterSizes()

  // Default: Show informational content
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-industrial text-white section-padding">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-white mb-4">Dumpster Sizes & Pricing</h1>
            <p className="text-xl text-gray-300 mb-6">
              Find the perfect dumpster size for your project. From small cleanouts to major renovations, we have you covered.
            </p>
            <Link href="/booking" className="btn-primary">
              Get Started - Enter Your Address
            </Link>
          </div>
        </div>
      </section>

      {/* Dumpster Sizes Grid */}
      <section className="section-padding bg-off-white">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dumpsters.map((dumpster) => (
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
                  <th className="px-6 py-4 text-left">Weight Included</th>
                  <th className="px-6 py-4 text-left">Rental Period</th>
                  <th className="px-6 py-4 text-left">Starting Price</th>
                </tr>
              </thead>
              <tbody>
                {dumpsters.map((dumpster, index) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dumpsters.map((dumpster) => (
              <div key={dumpster.size} className="card-industrial p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="w-10 h-10 bg-primary-light/10 rounded-full flex items-center justify-center mr-3 text-sm font-bold text-primary-green">
                    {dumpster.sizeNum}
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
        title="Ready to Book?"
        subtitle="Enter your address to check availability and get an instant quote!"
        primaryCTA={{ text: 'Start Booking', href: '/booking' }}
      />
    </>
  );
}

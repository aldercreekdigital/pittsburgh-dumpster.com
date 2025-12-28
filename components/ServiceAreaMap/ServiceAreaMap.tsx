import Link from 'next/link';
import { SERVICE_AREAS, PHONE_NUMBERS } from '@/lib/constants';

interface ServiceAreaMapProps {
  showFullDetails?: boolean;
}

export default function ServiceAreaMap({ showFullDetails = false }: ServiceAreaMapProps) {
  return (
    <div className="card-industrial p-6 md:p-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Our Service Area</h3>

      {/* Map Placeholder */}
      <div className="relative w-full h-64 md:h-80 bg-light-gray rounded-lg mb-6 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-primary-green/5">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-primary-green opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-steel-gray">Serving 50+ Counties Across 3 States</p>
            <p className="text-sm text-gray-500 mt-1">Western PA | Northern WV | Eastern OH</p>
          </div>
        </div>
        {/* State indicators */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="flex items-center bg-white/90 px-3 py-1 rounded-full text-sm shadow">
            <div className="w-3 h-3 bg-primary-green rounded-full mr-2"></div>
            <span>Pennsylvania</span>
          </div>
          <div className="flex items-center bg-white/90 px-3 py-1 rounded-full text-sm shadow">
            <div className="w-3 h-3 bg-accent-orange rounded-full mr-2"></div>
            <span>West Virginia</span>
          </div>
          <div className="flex items-center bg-white/90 px-3 py-1 rounded-full text-sm shadow">
            <div className="w-3 h-3 bg-accent-blue rounded-full mr-2"></div>
            <span>Ohio</span>
          </div>
        </div>
      </div>

      {/* Service Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pennsylvania */}
        <div className="space-y-3">
          <h4 className="font-bold text-primary-dark-green flex items-center">
            <div className="w-3 h-3 bg-primary-green rounded-full mr-2"></div>
            {SERVICE_AREAS.pennsylvania.name}
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            {(showFullDetails
              ? SERVICE_AREAS.pennsylvania.counties
              : SERVICE_AREAS.pennsylvania.counties.slice(0, 5)
            ).map((county) => (
              <li key={county}>{county}</li>
            ))}
            {!showFullDetails && SERVICE_AREAS.pennsylvania.counties.length > 5 && (
              <li className="text-primary-light">+ {SERVICE_AREAS.pennsylvania.counties.length - 5} more</li>
            )}
          </ul>
        </div>

        {/* West Virginia */}
        <div className="space-y-3">
          <h4 className="font-bold text-primary-dark-green flex items-center">
            <div className="w-3 h-3 bg-accent-orange rounded-full mr-2"></div>
            {SERVICE_AREAS.westVirginia.name}
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            {SERVICE_AREAS.westVirginia.counties.map((county) => (
              <li key={county}>{county}</li>
            ))}
          </ul>
        </div>

        {/* Ohio */}
        <div className="space-y-3">
          <h4 className="font-bold text-primary-dark-green flex items-center">
            <div className="w-3 h-3 bg-accent-blue rounded-full mr-2"></div>
            {SERVICE_AREAS.ohio.name}
          </h4>
          <ul className="text-gray-600 text-sm space-y-1">
            {SERVICE_AREAS.ohio.counties.map((county) => (
              <li key={county}>{county}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Not Sure CTA */}
      <div className="mt-8 p-4 bg-primary-dark-green/5 rounded-lg">
        <p className="text-sm text-gray-700 text-center">
          <strong>Not sure if we serve your area?</strong> We cover 50+ counties across three states.{' '}
          <br className="hidden sm:block" />
          Call us at{' '}
          <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="text-accent-orange font-bold hover:underline">
            {PHONE_NUMBERS.display}
          </a>{' '}
          or{' '}
          <Link href="/contact" className="text-accent-orange font-bold hover:underline">
            contact us online
          </Link>{' '}
          to confirm service availability.
        </p>
      </div>
    </div>
  );
}

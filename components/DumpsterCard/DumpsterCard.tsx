import Link from 'next/link';

interface DumpsterCardProps {
  size: string;
  dimensions: string;
  description: string;
  priceRange: string;
  idealFor: string[];
  capacity: string;
  weight: string;
  rentalPeriod: string;
  popular?: boolean;
}

export default function DumpsterCard({
  size,
  dimensions,
  description,
  priceRange,
  idealFor,
  capacity,
  weight,
  rentalPeriod,
  popular = false,
}: DumpsterCardProps) {
  return (
    <div className={`card-industrial p-6 relative ${popular ? 'ring-2 ring-accent-orange' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="badge badge-popular">MOST POPULAR</span>
        </div>
      )}

      {/* Size Header */}
      <div className="text-center mb-4">
        <h3 className="text-3xl font-bold text-primary-dark-green mb-1">{size}</h3>
        <p className="text-steel-gray text-sm">{dimensions}</p>
      </div>

      {/* Dumpster Illustration */}
      <div className="w-full h-24 mb-4 flex items-center justify-center">
        <svg viewBox="0 0 120 60" className="w-32 h-16">
          <rect x="10" y="15" width="100" height="40" rx="3" className="fill-primary-green" />
          <rect x="15" y="10" width="90" height="10" rx="2" className="fill-steel-gray" />
          <line x1="35" y1="15" x2="35" y2="55" stroke="#0A291A" strokeWidth="2" />
          <line x1="60" y1="15" x2="60" y2="55" stroke="#0A291A" strokeWidth="2" />
          <line x1="85" y1="15" x2="85" y2="55" stroke="#0A291A" strokeWidth="2" />
          <text x="60" y="40" textAnchor="middle" className="fill-white text-xs font-bold">
            {size.split(' ')[0]}
          </text>
        </svg>
      </div>

      <p className="text-gray-600 mb-4 text-center">{description}</p>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-accent-orange mb-1">{priceRange}</div>
        <p className="text-sm text-gray-500">+ taxes & fees</p>
      </div>

      {/* Features */}
      <div className="space-y-2 mb-6 text-sm">
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 text-primary-light mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{capacity}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 text-primary-light mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{weight}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <svg className="w-4 h-4 text-primary-light mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{rentalPeriod}</span>
        </div>
      </div>

      {/* Ideal For */}
      <div className="mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Ideal For:</p>
        <div className="flex flex-wrap gap-1">
          {idealFor.slice(0, 3).map((use, index) => (
            <span
              key={index}
              className="text-xs bg-light-gray text-steel-gray px-2 py-1 rounded"
            >
              {use}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/request-quote?size=${encodeURIComponent(size)}`}
        className={`block w-full text-center ${popular ? 'btn-primary' : 'btn-secondary'}`}
      >
        Select This Size
      </Link>
    </div>
  );
}

import Link from 'next/link';

interface HeroProps {
  title?: string;
  subtitle?: string;
  showCTA?: boolean;
  backgroundImage?: string;
}

export default function Hero({
  title = 'Dumpster Rental Services for Western PA, WV & OH',
  subtitle = 'Fast Delivery, Competitive Pricing, Reliable Service',
  showCTA = true,
  backgroundImage,
}: HeroProps) {
  return (
    <section className="relative bg-gradient-industrial overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #2E7D32 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative container-wide section-padding">
        <div className="max-w-4xl">
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm text-white/90">
              <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
              24/7 Online Booking
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm text-white/90">
              <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              Transparent Pricing
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm text-white/90">
              <svg className="w-4 h-4 mr-2 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Same-Day Delivery Available
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-white mb-6">{title}</h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">{subtitle}</p>

          {/* CTAs */}
          {showCTA && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/request-quote" className="btn-primary text-lg px-8 py-4">
                Get Instant Quote
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/dumpster-sizes" className="btn-secondary text-lg px-8 py-4">
                View Dumpster Sizes
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-orange">50+</div>
              <div className="text-sm text-gray-400">Counties Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-orange">3</div>
              <div className="text-sm text-gray-400">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-orange">1000+</div>
              <div className="text-sm text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-orange">Same Day</div>
              <div className="text-sm text-gray-400">Delivery Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute right-0 bottom-0 w-1/3 h-full hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary-dark-green z-10" />
        <div className="absolute right-0 bottom-0 w-full h-full opacity-20">
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="currentColor">
            <rect x="50" y="150" width="300" height="200" rx="10" className="text-primary-light" />
            <rect x="70" y="130" width="260" height="30" rx="5" className="text-steel-gray" />
            <line x1="120" y1="150" x2="120" y2="350" stroke="currentColor" strokeWidth="8" className="text-steel-gray" />
            <line x1="200" y1="150" x2="200" y2="350" stroke="currentColor" strokeWidth="8" className="text-steel-gray" />
            <line x1="280" y1="150" x2="280" y2="350" stroke="currentColor" strokeWidth="8" className="text-steel-gray" />
          </svg>
        </div>
      </div>
    </section>
  );
}

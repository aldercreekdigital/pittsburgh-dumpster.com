import Link from 'next/link';
import { PHONE_NUMBERS } from '@/lib/constants';

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  showPhone?: boolean;
  variant?: 'default' | 'dark' | 'orange';
}

export default function CTABanner({
  title = 'Ready to Get Started?',
  subtitle = 'Get your free quote today. Fast delivery, competitive pricing, reliable service.',
  primaryCTA = { text: 'Get Free Quote', href: '/request-quote' },
  showPhone = true,
  variant = 'default',
}: CTABannerProps) {
  const bgClass = {
    default: 'bg-gradient-industrial',
    dark: 'bg-primary-dark-green',
    orange: 'bg-accent-orange',
  }[variant];

  return (
    <section className={`${bgClass} text-white`}>
      <div className="container-wide section-padding">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-white mb-4">{title}</h2>
          <p className="text-lg text-gray-300 mb-8">{subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={primaryCTA.href}
              className={variant === 'orange' ? 'btn-secondary text-lg px-8 py-4' : 'btn-primary text-lg px-8 py-4'}
            >
              {primaryCTA.text}
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {showPhone && (
              <a
                href={`tel:${PHONE_NUMBERS.tracked.website}`}
                className="flex items-center text-lg font-bold hover:text-accent-yellow transition"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {PHONE_NUMBERS.display}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

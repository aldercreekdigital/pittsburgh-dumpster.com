import Link from 'next/link';
import { BUSINESS_INFO, PHONE_NUMBERS, SERVICE_AREAS, HOURS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-primary-dark-green text-white">
      {/* Main Footer */}
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold font-heading block">McCrackan</span>
                <span className="text-sm text-gray-400">Roll-Off Services</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Fast, reliable dumpster rental services serving Western Pennsylvania, West Virginia, and Ohio.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Address:</strong>
                <br />
                {BUSINESS_INFO.address.street}
                <br />
                {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state} {BUSINESS_INFO.address.zip}
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href={`tel:${PHONE_NUMBERS.tracked.website}`} className="text-accent-orange hover:underline">
                  {PHONE_NUMBERS.display}
                </a>
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${BUSINESS_INFO.email}`} className="text-accent-orange hover:underline">
                  {BUSINESS_INFO.email}
                </a>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dumpster-sizes" className="text-gray-400 hover:text-white transition">
                  Dumpster Sizes & Pricing
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/request-quote" className="text-gray-400 hover:text-white transition">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/service-area" className="text-gray-400 hover:text-white transition">
                  Service Area
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-white transition">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/residential" className="text-gray-400 hover:text-white transition">
                  Residential Dumpster Rental
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="text-gray-400 hover:text-white transition">
                  Commercial Services
                </Link>
              </li>
              <li>
                <Link href="/construction" className="text-gray-400 hover:text-white transition">
                  Construction Dumpsters
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Demolition Debris Removal</span>
              </li>
              <li>
                <span className="text-gray-400">Roofing Material Disposal</span>
              </li>
              <li>
                <span className="text-gray-400">Estate Cleanouts</span>
              </li>
            </ul>
          </div>

          {/* Hours & Service Area */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hours of Operation</h3>
            <ul className="space-y-2 text-gray-400 mb-6">
              <li>
                <strong className="text-white">Mon-Fri:</strong> {HOURS.weekdays}
              </li>
              <li>
                <strong className="text-white">Saturday:</strong> {HOURS.saturday}
              </li>
              <li>
                <strong className="text-white">Sunday:</strong> {HOURS.sunday}
              </li>
            </ul>
            <h3 className="text-lg font-bold mb-2">Service Areas</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>{SERVICE_AREAS.pennsylvania.name}</li>
              <li>{SERVICE_AREAS.westVirginia.name}</li>
              <li>{SERVICE_AREAS.ohio.name}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-green/30">
        <div className="container-wide py-6 px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.
            <br className="md:hidden" />
            <span className="hidden md:inline"> | </span>
            A division of {BUSINESS_INFO.parentBrand}
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition"
              aria-label="Google Business"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

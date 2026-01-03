import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://pittsburgh-dumpster.com'),
  title: 'McCrackan Roll-Off Services | Dumpster Rental in Western PA, WV & OH',
  description:
    'Fast, reliable dumpster rental services serving Western Pennsylvania, West Virginia, and Ohio. Same-day delivery available. 10, 20, 30, and 40 yard roll-off containers.',
  keywords: [
    'dumpster rental',
    'roll off container',
    'Pittsburgh dumpster',
    'Western PA dumpster rental',
    'WV dumpster rental',
    'Ohio dumpster rental',
    'construction dumpster',
    'residential dumpster',
    'commercial dumpster',
  ],
  authors: [{ name: 'McCrackan Roll-Off Services' }],
  creator: 'McCrackan Roll-Off Services',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pittsburgh-dumpster.com',
    siteName: 'McCrackan Roll-Off Services',
    title: 'McCrackan Roll-Off Services | Dumpster Rental',
    description: 'Dumpster Rental Services for Western PA, WV & OH - Fast Delivery, Competitive Pricing',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'McCrackan Roll-Off Services - Dumpster Rental',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'McCrackan Roll-Off Services | Dumpster Rental',
    description: 'Dumpster Rental Services for Western PA, WV & OH',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://pittsburgh-dumpster.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0A291A" />
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'McCrackan Roll-Off Services',
              image: 'https://pittsburgh-dumpster.com/logo.png',
              '@id': 'https://pittsburgh-dumpster.com',
              url: 'https://pittsburgh-dumpster.com',
              telephone: '+1-412-555-3867',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '1555 Oakdale Road',
                addressLocality: 'Oakdale',
                addressRegion: 'PA',
                postalCode: '15071',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 40.3985,
                longitude: -80.1848,
              },
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '07:00',
                  closes: '19:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Saturday',
                  opens: '08:00',
                  closes: '17:00',
                },
              ],
              priceRange: '$$',
              serviceArea: [
                { '@type': 'State', name: 'Pennsylvania' },
                { '@type': 'State', name: 'West Virginia' },
                { '@type': 'State', name: 'Ohio' },
              ],
              areaServed: {
                '@type': 'GeoCircle',
                geoMidpoint: {
                  '@type': 'GeoCoordinates',
                  latitude: 40.3985,
                  longitude: -80.1848,
                },
                geoRadius: '80000',
              },
              sameAs: [
                'https://www.facebook.com/mccrackanrolloff',
                'https://www.instagram.com/mccrackanrolloff',
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

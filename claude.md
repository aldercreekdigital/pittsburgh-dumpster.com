# McCrackan Roll-Off Services Website Build Specification

## 🗑️ Project Overview

**Site Name**: McCrackan Roll-Off Services  
**Domain**: pittsburgh-dumpster.com (development: localhost:3000)  
**Business Type**: Dumpster & Roll-Off Container Rental  
**Service Area**: Western Pennsylvania, parts of West Virginia and Ohio  
**Parent Brand**: McCrackan Enterprises (sibling to Brandon's Lawn & Landscape)

**Design Directive**: Dark, professional color scheme based on provided logo
**Technology Stack**: Next.js 14 (App Router), Tailwind CSS, TypeScript

## 🎨 Design System & Colors

### Color Palette (Derived from Logo)
```css
/* Primary Colors - Dark, professional, industrial feel */
--primary-dark-green: #0A291A;     /* Main brand green from logo */
--primary-green: #1C3B2A;          /* Slightly lighter for backgrounds */
--accent-green: #2E7D32;           /* Brandon's green for connection */
--accent-orange: #E65100;          /* Safety/CTA orange (contrast) */
--accent-yellow: #FFB300;          /* Warning/attention yellow */

/* Neutral Colors - Industrial & Clean */
--white: #FFFFFF;
--off-white: #F8F9FA;
--light-gray: #E9ECEF;
--medium-gray: #6C757D;
--dark-gray: #343A40;
--steel-gray: #495057;            /* Industrial feel */
--black: #212529;

/* Utility Colors */
--safety-red: #DC3545;            /* For important warnings */
--info-blue: #0D6EFD;             /* Trust/contact elements */
```

### Typography
- **Headings**: "Roboto Condensed", "Segoe UI", system-ui, sans-serif (bold, industrial feel)
- **Body**: "Roboto", "Helvetica Neue", Arial, sans-serif (clean, readable)
- **Font Weights**: Heavy for CTAs (700), medium for subheads (600), regular for body (400)

## 🏗️ Project Structure

```
mccrackan-roll-off/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── dumpster-sizes/
│   │   └── page.tsx
│   ├── how-it-works/
│   │   └── page.tsx
│   ├── service-area/
│   │   └── page.tsx
│   ├── residential/
│   │   └── page.tsx
│   ├── commercial/
│   │   └── page.tsx
│   ├── construction/
│   │   └── page.tsx
│   ├── faq/
│   │   └── page.tsx
│   ├── request-quote/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   ├── Footer/
│   │   └── Footer.tsx
│   ├── Hero/
│   │   └── Hero.tsx
│   ├── DumpsterCard/
│   │   └── DumpsterCard.tsx
│   ├── ServiceAreaMap/
│   │   └── ServiceAreaMap.tsx
│   ├── QuoteForm/
│   │   └── QuoteForm.tsx
│   ├── CTABanner/
│   │   └── CTABanner.tsx
│   └── Testimonials/
│       └── Testimonials.tsx
├── lib/
│   ├── constants.ts
│   └── utils.ts
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── dumpsters/
│   │   ├── projects/
│   │   └── logo/
│   └── favicon.ico
├── tailwind.config.js
├── next.config.js
└── package.json
```

## 📱 Core Pages & Content

### 1. Homepage (`app/page.tsx`)
**Goal**: Immediate clarity on services, pricing, and quick quote conversion

**Sections**:
1. **Hero Banner**: Clean industrial image with dumpster on job site
   - Headline: "Dumpster Rental Services for Western PA, WV & OH"
   - Subheadline: "Fast Delivery, Competitive Pricing, Reliable Service"
   - Primary CTA: "Get Instant Quote" (links to quote form)
   - Secondary CTA: "View Dumpster Sizes"
   - Trust indicators: "24/7 Online Booking", "Same-Day Delivery Available"

2. **Service Area Highlights**
   - Western Pennsylvania (featured)
   - Northern West Virginia
   - Eastern Ohio
   - "Servicing 50+ Counties"

3. **Popular Dumpster Sizes** (3-4 cards)
   - 10 Yard: "Small Renovations, Garage Cleanouts"
   - 20 Yard: "Kitchen Remodels, Roofing Projects"
   - 30 Yard: "New Construction, Large Demolition"
   - 40 Yard: "Major Construction, Commercial Projects"

4. **Use Case Grid** (Residential, Commercial, Construction)
   - Icons and brief descriptions
   - Links to dedicated pages

5. **How It Works** (Simple 3-step process)
   - 1. Choose Size & Schedule
   - 2. We Deliver & Place
   - 3. You Fill, We Haul Away

6. **Trust Indicators**
   - Licensed & Insured
   - No Hidden Fees
   - Environmentally Responsible Disposal
   - Family-Owned & Operated

### 2. Dumpster Sizes & Pricing (`app/dumpster-sizes/page.tsx`)
**Critical Conversion Page**:

| Size | Dimensions | Ideal For | Price Range | CTA |
|------|------------|-----------|-------------|-----|
| 10 yd | 12'L x 8'W x 4'H | Small remodels, garage cleanout | $XXX-XXX | Select |
| 20 yd | 22'L x 8'W x 4'H | Kitchen/bath remodel, roofing | $XXX-XXX | Select |
| 30 yd | 22'L x 8'W x 6'H | New construction, large demolition | $XXX-XXX | Select |
| 40 yd | 22'L x 8'W x 8'H | Major construction, commercial | $XXX-XXX | Select |

**Features**:
- Interactive size comparison
- "What Fits" visual guides
- Rental period information (7, 10, 14-day options)
- Prohibited items list (expandable)

### 3. Service Area (`app/service-area/page.tsx`)
**Local SEO Power Page**:
- Interactive map showing coverage
- County/Region breakdown:
  **Western PA**: Allegheny, Washington, Beaver, Butler, etc.
  **WV**: Ohio, Marshall, Brooke, Hancock counties
  **OH**: Jefferson, Columbiana, Mahoning counties
- "We Serve These Cities" list with 50+ locations
- "Not Sure If We Serve You?" form

### 4. Project Type Pages
- **Residential** (`/residential`): Home renovations, cleanouts, landscaping debris
- **Commercial** (`/commercial`): Business cleanouts, office renovations
- **Construction** (`/construction`): New builds, demolition, contractor services

### 5. How It Works / FAQ (`app/how-it-works/`, `/faq/`)
- Simple 3-4 step process with icons
- Comprehensive FAQ:
  - Pricing & Payment
  - Placement & Access
  - What Can/Cannot Go in Dumpster
  - Permits & Regulations
  - Weight Limits & Overages

### 6. Request Quote (`app/request-quote/page.tsx`)
**Optimized Conversion Form**:
- Dumpster size selection
- Project type dropdown
- Delivery address with auto-suggest
- Desired dates
- Contact info
- Project description (optional)
- "Get Instant Price Estimate" button

## 🔧 Technical Implementation

### Tailwind Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          'dark-green': '#0A291A',
          green: '#1C3B2A',
          light: '#2E7D32', // Brandon's green for connection
        },
        accent: {
          orange: '#E65100',
          yellow: '#FFB300',
          blue: '#0D6EFD',
          red: '#DC3545',
        },
        industrial: {
          gray: '#495057',
          steel: '#6C757D',
        }
      },
      fontFamily: {
        heading: ['Roboto Condensed', 'Segoe UI', 'sans-serif'],
        body: ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-industrial': 'linear-gradient(135deg, #0A291A 0%, #1C3B2A 100%)',
        'pattern-dots': 'radial-gradient(#2E7D32 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
```

### Global Styles (`app/globals.css`)
```css
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;600;700&family=Roboto:wght@300;400;500;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply font-body text-gray-800 bg-off-white;
  }
  
  h1, h2, h3, h4 {
    @apply font-heading font-bold text-primary-dark-green;
  }
  
  h1 {
    @apply text-4xl md:text-5xl lg:text-6xl;
  }
  
  h2 {
    @apply text-3xl md:text-4xl;
  }
  
  h3 {
    @apply text-2xl md:text-3xl;
  }
}

@layer components {
  .btn-primary {
    @apply bg-accent-orange text-white font-bold py-3 px-8 rounded-lg 
           hover:bg-orange-700 transition duration-300 shadow-lg 
           hover:shadow-xl transform hover:-translate-y-1 
           border-2 border-orange-600;
  }
  
  .btn-secondary {
    @apply bg-primary-dark-green text-white font-bold py-3 px-8 rounded-lg 
           hover:bg-black transition duration-300 border-2 border-primary-green;
  }
  
  .card-industrial {
    @apply bg-white rounded-xl shadow-md border border-industrial-gray 
           hover:shadow-lg transition duration-300;
  }
  
  .section-padding {
    @apply py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8;
  }
  
  .container-wide {
    @apply max-w-7xl mx-auto;
  }
  
  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-bold;
  }
  
  .badge-safety {
    @apply bg-accent-red/10 text-accent-red border border-accent-red/20;
  }
  
  .badge-popular {
    @apply bg-accent-yellow/10 text-amber-800 border border-amber-300;
  }
}
```

### Root Layout (`app/layout.tsx`)
```tsx
import type { Metadata } from 'next'
import { Roboto, Roboto_Condensed } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header/Header'
import Footer from '@/components/Footer/Footer'

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

const robotoCondensed = Roboto_Condensed({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-condensed',
})

export const metadata: Metadata = {
  title: 'McCrackan Roll-Off Services | Dumpster Rental in Western PA, WV & OH',
  description: 'Fast, reliable dumpster rental services serving Western Pennsylvania, West Virginia, and Ohio. Same-day delivery available.',
  keywords: ['dumpster rental', 'roll off container', 'Pittsburgh', 'Western PA', 'WV', 'Ohio', 'construction dumpster'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pittsburgh-dumpster.com',
    title: 'McCrackan Roll-Off Services',
    description: 'Dumpster Rental Services for Western PA, WV & OH',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoCondensed.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "McCrackan Roll-Off Services",
              "image": "https://pittsburgh-dumpster.com/logo.png",
              "@id": "https://pittsburgh-dumpster.com",
              "url": "https://pittsburgh-dumpster.com",
              "telephone": "+1-XXX-XXX-XXXX",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1555 Oakdale Road",
                "addressLocality": "Oakdale",
                "addressRegion": "PA",
                "postalCode": "15071",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 40.3985,
                "longitude": -80.1848
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "07:00",
                "closes": "19:00"
              },
              "priceRange": "$$",
              "serviceArea": {
                "@type": "State",
                "name": ["PA", "WV", "OH"]
              }
            })
          }}
        />
      </head>
      <body className={`${roboto.className} bg-gradient-to-b from-white to-gray-50`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

## 📊 SEO & Local Optimization

### Critical Local SEO Elements:
1. **Service Area Pages**: Create pages for major cities
   - `/dumpster-rental-pittsburgh`
   - `/dumpster-rental-wheeling-wv`
   - `/dumpster-rental-youngstown-oh`

2. **Location-Specific Content**:
   - "Dumpster Rental Pittsburgh PA"
   - "Roll Off Containers Western Pennsylvania"
   - "Same Day Dumpster Delivery [City Name]"

3. **GMB Optimization**:
   - Primary category: "Dumpster Rental Service"
   - Secondary: "Waste Management Service", "Recycling Center"
   - Service area set to 50-mile radius from Oakdale
   - Photos of dumpsters on job sites

### On-Page SEO Strategy:
- **Title Tags**: Include city + service + "dumpster rental"
- **Meta Descriptions**: Include primary service area
- **Header Structure**: Location keywords in H2/H3
- **Local Citations**: NAP consistency across directories

## 📱 Key Components

### DumpsterCard Component:
```tsx
interface DumpsterCardProps {
  size: string;
  dimensions: string;
  description: string;
  price: string;
  popular?: boolean;
  features: string[];
}

const DumpsterCard: React.FC<DumpsterCardProps> = ({ 
  size, dimensions, description, price, popular, features 
}) => (
  <div className="card-industrial p-6 relative">
    {popular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="badge badge-popular">MOST POPULAR</span>
      </div>
    )}
    <div className="text-center mb-4">
      <h3 className="text-3xl font-bold text-primary-dark-green">{size}</h3>
      <p className="text-industrial-gray text-sm">{dimensions}</p>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="mb-6">
      <div className="text-2xl font-bold text-accent-orange mb-2">{price}</div>
      <p className="text-sm text-gray-500">+ taxes & fees</p>
    </div>
    <ul className="space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-5 h-5 text-primary-green mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button className="btn-primary w-full">Select This Size</button>
  </div>
);
```

### ServiceAreaMap Component:
```tsx
const ServiceAreaMap = () => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h3 className="text-2xl font-bold mb-4">Our Service Area</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <h4 className="font-bold text-primary-dark-green">Western Pennsylvania</h4>
        <ul className="text-gray-600">
          <li>Allegheny County</li>
          <li>Washington County</li>
          <li>Beaver County</li>
          <li>Butler County</li>
          <li>Lawrence County</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h4 className="font-bold text-primary-dark-green">West Virginia</h4>
        <ul className="text-gray-600">
          <li>Ohio County</li>
          <li>Marshall County</li>
          <li>Brooke County</li>
          <li>Hancock County</li>
        </ul>
      </div>
      <div className="space-y-2">
        <h4 className="font-bold text-primary-dark-green">Ohio</h4>
        <ul className="text-gray-600">
          <li>Jefferson County</li>
          <li>Columbiana County</li>
          <li>Mahoning County</li>
        </ul>
      </div>
    </div>
    <div className="mt-6 p-4 bg-primary-dark-green/5 rounded-lg">
      <p className="text-sm text-gray-700">
        <strong>Not sure if we serve your area?</strong> We cover 50+ counties across three states. 
        Call us at <a href="tel:+1-XXX-XXX-XXXX" className="text-accent-orange font-bold">XXX-XXX-XXXX</a> 
        to confirm service availability.
      </p>
    </div>
  </div>
);
```

## 🎯 Marketing Integration

### Call Tracking Setup:
```tsx
// In lib/constants.ts
export const PHONE_NUMBERS = {
  primary: '+1-XXX-XXX-XXXX',
  tracked: {
    website: '+1-XXX-XXX-XXXX',
    googleAds: '+1-XXX-XXX-XXXX',
    facebook: '+1-XXX-XXX-XXXX',
  }
};

// Usage in components
import { PHONE_NUMBERS } from '@/lib/constants';

const PhoneLink = () => (
  <a 
    href={`tel:${PHONE_NUMBERS.tracked.website}`}
    className="text-accent-orange font-bold hover:underline"
  >
    {PHONE_NUMBERS.primary}
  </a>
);
```

### UTM Parameter Strategy:
- Source: `website`, `google`, `facebook`, `nextdoor`
- Medium: `organic`, `cpc`, `social`
- Campaign: `dumpster-sizes`, `instant-quote`, `service-area`

## 🚀 Performance & Launch

### Core Web Vitals Focus:
- LCP: Optimize hero image (WebP, lazy loading)
- CLS: Reserve space for images, stable layouts
- FID: Minimal JavaScript, efficient form handling

### Launch Checklist:
- [ ] Google Business Profile created
- [ ] Bing Places for Business setup
- [ ] Local citations (Yelp, YellowPages, HomeAdvisor)
- [ ] Schema markup validated
- [ ] Mobile responsiveness tested
- [ ] Form submissions working
- [ ] Analytics tracking (GA4, GSC)
- [ ] SSL certificate configured
- [ ] Sitemap submitted to search engines

---

This specification creates a professional, industrial-themed website that converts visitors into dumpster rental customers. The dark green color scheme matches your logo while providing strong contrast for CTAs and important information. The site is optimized for local SEO across three states and designed to facilitate quick, easy quoting and booking.

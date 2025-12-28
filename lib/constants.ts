// Business Information
export const BUSINESS_INFO = {
  name: 'McCrackan Roll-Off Services',
  tagline: 'Dumpster Rental Services for Western PA, WV & OH',
  address: {
    street: '1555 Oakdale Road',
    city: 'Oakdale',
    state: 'PA',
    zip: '15071',
  },
  email: 'info@pittsburgh-dumpster.com',
  parentBrand: 'McCrackan Enterprises',
  siblingBrand: "Brandon's Lawn & Landscape",
};

// Phone Numbers (can be swapped for call tracking)
export const PHONE_NUMBERS = {
  primary: '(412) 555-DUMP',
  display: '(412) 555-3867',
  tracked: {
    website: '+1-412-555-3867',
    googleAds: '+1-412-555-3868',
    facebook: '+1-412-555-3869',
  },
};

// Navigation Links
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/dumpster-sizes', label: 'Dumpster Sizes' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/service-area', label: 'Service Area' },
  {
    label: 'Services',
    children: [
      { href: '/residential', label: 'Residential' },
      { href: '/commercial', label: 'Commercial' },
      { href: '/construction', label: 'Construction' },
    ],
  },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

// Dumpster Sizes Data
export const DUMPSTER_SIZES = [
  {
    size: '10 Yard',
    dimensions: "12'L x 8'W x 4'H",
    description: 'Perfect for small renovations, garage cleanouts, and minor landscaping projects.',
    priceRange: '$299-$399',
    idealFor: ['Small remodels', 'Garage cleanout', 'Deck removal', 'Small landscaping'],
    capacity: '3-4 pickup truck loads',
    weight: '2 ton limit',
    rentalPeriod: '7 days included',
    popular: false,
  },
  {
    size: '20 Yard',
    dimensions: "22'L x 8'W x 4'H",
    description: 'Our most popular size for kitchen/bath remodels, roofing projects, and medium cleanouts.',
    priceRange: '$399-$499',
    idealFor: ['Kitchen remodel', 'Bathroom renovation', 'Roofing (up to 25 sq)', 'Medium cleanout'],
    capacity: '6-8 pickup truck loads',
    weight: '3 ton limit',
    rentalPeriod: '7 days included',
    popular: true,
  },
  {
    size: '30 Yard',
    dimensions: "22'L x 8'W x 6'H",
    description: 'Great for new construction, large demolition, and major renovation projects.',
    priceRange: '$499-$599',
    idealFor: ['New construction', 'Large demolition', 'Whole house cleanout', 'Commercial projects'],
    capacity: '9-12 pickup truck loads',
    weight: '4 ton limit',
    rentalPeriod: '10 days included',
    popular: false,
  },
  {
    size: '40 Yard',
    dimensions: "22'L x 8'W x 8'H",
    description: 'Our largest container for major construction, commercial projects, and large-scale demolition.',
    priceRange: '$599-$749',
    idealFor: ['Major construction', 'Commercial renovation', 'Industrial projects', 'Large demolition'],
    capacity: '12-16 pickup truck loads',
    weight: '5 ton limit',
    rentalPeriod: '14 days included',
    popular: false,
  },
];

// Service Areas
export const SERVICE_AREAS = {
  pennsylvania: {
    name: 'Western Pennsylvania',
    counties: [
      'Allegheny County',
      'Washington County',
      'Beaver County',
      'Butler County',
      'Lawrence County',
      'Westmoreland County',
      'Fayette County',
      'Greene County',
      'Armstrong County',
      'Indiana County',
    ],
    cities: [
      'Pittsburgh',
      'Canonsburg',
      'Washington',
      'Beaver',
      'Cranberry',
      'Wexford',
      'Moon Township',
      'Robinson',
      'Greensburg',
      'Latrobe',
    ],
  },
  westVirginia: {
    name: 'Northern West Virginia',
    counties: ['Ohio County', 'Marshall County', 'Brooke County', 'Hancock County', 'Wetzel County'],
    cities: ['Wheeling', 'Moundsville', 'Weirton', 'New Martinsville', 'Chester'],
  },
  ohio: {
    name: 'Eastern Ohio',
    counties: ['Jefferson County', 'Columbiana County', 'Mahoning County', 'Trumbull County'],
    cities: ['Steubenville', 'East Liverpool', 'Youngstown', 'Warren', 'Salem'],
  },
};

// FAQ Data
export const FAQ_ITEMS = [
  {
    category: 'Pricing & Payment',
    questions: [
      {
        question: 'What is included in the rental price?',
        answer: 'Our rental price includes delivery, pickup, disposal fees for standard waste, and the rental period specified for each dumpster size. Additional days and overweight charges may apply.',
      },
      {
        question: 'Do you require a deposit?',
        answer: 'We may require a deposit for first-time customers or longer rental periods. This will be communicated during the booking process.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, checks, and cash. Payment is due upon delivery unless other arrangements have been made.',
      },
    ],
  },
  {
    category: 'Placement & Access',
    questions: [
      {
        question: 'Where can the dumpster be placed?',
        answer: 'Dumpsters can be placed on driveways, parking lots, or streets (with proper permits). We need a flat, level surface with adequate access for our delivery truck.',
      },
      {
        question: 'Do I need a permit?',
        answer: 'Permits are typically required when placing a dumpster on a public street. We can help guide you through the permit process for your area.',
      },
      {
        question: 'How much clearance is needed for delivery?',
        answer: 'We need at least 60 feet of overhead clearance and a 12-foot wide path for our delivery truck. Please ensure there are no low-hanging wires or tree branches.',
      },
    ],
  },
  {
    category: 'What Can/Cannot Go in the Dumpster',
    questions: [
      {
        question: 'What items are prohibited?',
        answer: 'Hazardous materials, chemicals, paint, tires, batteries, appliances with freon, medical waste, and electronics are not allowed. Contact us for a complete list.',
      },
      {
        question: 'Can I dispose of concrete or dirt?',
        answer: 'Yes, but heavy materials like concrete, dirt, brick, and stone have special weight limits. We offer dedicated heavy debris containers for these materials.',
      },
      {
        question: 'What about yard waste?',
        answer: 'Yard waste such as branches, leaves, and grass clippings are accepted. However, they cannot be mixed with construction debris in the same container.',
      },
    ],
  },
  {
    category: 'Weight Limits & Overages',
    questions: [
      {
        question: 'What happens if I exceed the weight limit?',
        answer: 'Overweight charges apply at $75-$100 per additional ton, depending on the dumpster size. We recommend staying within the weight limit to avoid extra fees.',
      },
      {
        question: 'How do I know how much my debris weighs?',
        answer: "We weigh every load at the disposal facility. A good rule of thumb: avoid filling the dumpster more than 3/4 full with heavy materials like roofing or concrete.",
      },
    ],
  },
];

// Prohibited Items
export const PROHIBITED_ITEMS = [
  'Hazardous waste',
  'Chemicals & solvents',
  'Paint & stains',
  'Automotive fluids',
  'Tires',
  'Batteries',
  'Appliances with freon',
  'Electronics (TVs, monitors)',
  'Medical waste',
  'Asbestos',
  'Propane tanks',
  'Flammable materials',
];

// Trust Indicators
export const TRUST_INDICATORS = [
  {
    title: 'Licensed & Insured',
    description: 'Fully licensed and insured for your protection',
    icon: 'shield',
  },
  {
    title: 'No Hidden Fees',
    description: 'Transparent pricing with no surprise charges',
    icon: 'dollar',
  },
  {
    title: 'Eco-Friendly Disposal',
    description: 'Environmentally responsible waste management',
    icon: 'leaf',
  },
  {
    title: 'Family-Owned',
    description: 'Local family business serving the community',
    icon: 'heart',
  },
];

// Hours of Operation
export const HOURS = {
  weekdays: '7:00 AM - 7:00 PM',
  saturday: '8:00 AM - 5:00 PM',
  sunday: 'Closed (Emergency service available)',
};

// Shared UUIDs
export const IDS = {
  business: '00000000-0000-0000-0000-000000000001',
  customer: 'cust-1111-1111-1111-111111111111',
  user: 'user-2222-2222-2222-222222222222',
  admin: 'admin-3333-3333-3333-333333333333',
  quote: 'quot-4444-4444-4444-444444444444',
  address: 'addr-5555-5555-5555-555555555555',
  cart: 'cart-6666-6666-6666-666666666666',
  cartItem: 'item-7777-7777-7777-777777777777',
  bookingRequest: 'breq-8888-8888-8888-888888888888',
  booking: 'book-9999-9999-9999-999999999999',
  invoice: 'inv-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  dumpster: 'dump-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  serviceArea: 'sa-cccc-cccc-cccc-cccccccccccc',
  pricingRule: 'pr-dddd-dddd-dddd-dddddddddddd',
  stripeCustomer: 'sc-eeee-eeee-eeee-eeeeeeeeeeee',
  dumpTicket: 'dt-ffff-ffff-ffff-ffffffffffff',
} as const

// Mock user objects
export const MOCK_USER = {
  id: IDS.user,
  email: 'customer@example.com',
  user_metadata: { full_name: 'Test Customer', phone: '412-555-0100' },
}

export const MOCK_ADMIN_USER = {
  id: IDS.admin,
  email: 'admin@example.com',
  role: 'admin',
}

// Pricing snapshot
export const PRICING_SNAPSHOT = {
  total: 42500,
  subtotal: 35000,
  base_price: 30000,
  delivery_fee: 0,
  haul_fee: 0,
  extra_days: 0,
  extra_day_fee: 500,
  extended_service_fee: 0,
  taxable_amount: 35000,
  tax_rate: 0.07,
  tax_amount: 2450,
  processing_fee: 5050,
  dumpster_size: 10,
  waste_type: 'construction_debris',
  included_days: 7,
  included_tons: 1,
  rental_days: 7,
  tax_exempt: false,
}

// Pricing rule row from DB
export const PRICING_RULE = {
  id: IDS.pricingRule,
  business_id: IDS.business,
  dumpster_size: 10,
  waste_type: 'construction_debris',
  base_price: 30000,
  delivery_fee: 0,
  haul_fee: 0,
  included_days: 7,
  extra_day_fee: 500,
  included_tons: '1.0',
  overage_per_ton: 7500,
  active: true,
  public_notes: null,
}

// GeoJSON polygon covering Pittsburgh area
export const SERVICE_AREA_POLYGON = {
  type: 'Polygon' as const,
  coordinates: [[
    [-80.2, 40.2],
    [-79.7, 40.2],
    [-79.7, 40.6],
    [-80.2, 40.6],
    [-80.2, 40.2],
  ]],
}

export const SERVICE_AREA_ROW = {
  id: IDS.serviceArea,
  name: 'Greater Pittsburgh',
  polygon: SERVICE_AREA_POLYGON,
  active: true,
}

// Point inside service area (downtown Pittsburgh)
export const POINT_INSIDE = { lat: 40.4406, lng: -79.9959 }
// Point outside service area
export const POINT_OUTSIDE = { lat: 41.0, lng: -75.0 }

// Invoice data as returned by DB joins
export const INVOICE_ROW = {
  id: IDS.invoice,
  invoice_number: '1001',
  status: 'unpaid',
  total: PRICING_SNAPSHOT.total,
  subtotal: PRICING_SNAPSHOT.subtotal,
  customer_id: IDS.customer,
  booking_request_id: IDS.bookingRequest,
  customer: { id: IDS.customer, name: 'Test Customer', email: 'customer@example.com' },
  booking_request: {
    id: IDS.bookingRequest,
    customer_id: IDS.customer,
    quote: {
      id: IDS.quote,
      address_id: IDS.address,
      dumpster_size: 10,
      waste_type: 'construction_debris',
      dropoff_date: '2025-07-01',
      pickup_date: '2025-07-08',
      pricing_snapshot: PRICING_SNAPSHOT,
      address: { full_address: '123 Main St, Pittsburgh, PA 15213' },
    },
    customer: { id: IDS.customer, name: 'Test Customer', email: 'customer@example.com' },
  },
  line_items: [
    { id: 'li-1', label: 'Dumpster Rental', amount: 30000, line_type: 'base' },
    { id: 'li-2', label: 'PA Sales Tax', amount: 2450, line_type: 'tax' },
  ],
}

// Booking request with full joins
export const BOOKING_REQUEST_ROW = {
  id: IDS.bookingRequest,
  status: 'pending',
  customer_id: IDS.customer,
  quote: {
    id: IDS.quote,
    pricing_snapshot: PRICING_SNAPSHOT,
    dumpster_size: 10,
    waste_type: 'construction_debris',
    dropoff_date: '2025-07-01',
    pickup_date: '2025-07-08',
    address: { full_address: '123 Main St, Pittsburgh, PA 15213' },
    line_items: [
      { label: 'Dumpster Rental', amount: 30000, sort_order: 0, line_type: 'base' },
    ],
  },
  customer: { id: IDS.customer, name: 'Test Customer', email: 'customer@example.com' },
}

// Cart item with quote join
export const CART_ITEM_WITH_QUOTE = {
  id: IDS.cartItem,
  quote_id: IDS.quote,
  quotes: {
    id: IDS.quote,
    address_id: IDS.address,
    waste_type: 'construction_debris',
    dumpster_size: 10,
    dropoff_date: '2025-07-01',
    pickup_date: '2025-07-08',
    pricing_snapshot: PRICING_SNAPSHOT,
    status: 'draft',
    addresses: { full_address: '123 Main St, Pittsburgh, PA 15213' },
  },
}

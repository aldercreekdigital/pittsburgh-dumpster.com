-- Pittsburgh Dumpster Booking System - Initial Schema
-- All prices stored in cents (integers). Never use floats for money.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE BUSINESS TABLES
-- ============================================

-- Businesses (SaaS-ready: everything has business_id)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Users (admin roles)
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'dispatcher', 'accounting', 'driver', 'read_only')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, user_id)
);

-- Business Settings (configurable per business)
CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CUSTOMER & ADDRESS TABLES
-- ============================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, email)
);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  full_address TEXT NOT NULL,
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  place_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SERVICE AREA & PRICING
-- ============================================

-- Service Areas (GeoJSON polygons)
CREATE TABLE service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  polygon JSONB NOT NULL, -- GeoJSON polygon
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing Rules
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  waste_type TEXT NOT NULL CHECK (waste_type IN ('construction_debris', 'household_trash')),
  dumpster_size INT NOT NULL CHECK (dumpster_size IN (10, 15, 20, 30, 40)),
  base_price INT NOT NULL, -- cents
  delivery_fee INT NOT NULL DEFAULT 0, -- cents
  haul_fee INT NOT NULL DEFAULT 0, -- cents
  included_days INT NOT NULL DEFAULT 3,
  extra_day_fee INT NOT NULL DEFAULT 2500, -- cents ($25)
  included_tons NUMERIC(6,2) NOT NULL DEFAULT 1.00,
  overage_per_ton INT NOT NULL DEFAULT 10000, -- cents ($100)
  public_notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: only one active rule per business/waste_type/size combo
CREATE UNIQUE INDEX pricing_rules_unique_active
  ON pricing_rules (business_id, waste_type, dumpster_size)
  WHERE active = TRUE;

-- ============================================
-- QUOTES & CARTS
-- ============================================

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  waste_type TEXT CHECK (waste_type IN ('construction_debris', 'household_trash')),
  dumpster_size INT CHECK (dumpster_size IN (10, 15, 20, 30, 40)),
  dropoff_date DATE,
  pickup_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'expired', 'converted')),
  expires_at TIMESTAMPTZ,
  pricing_snapshot JSONB, -- LOCKED numbers in cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quote Line Items
CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount INT NOT NULL, -- cents (can be negative for discounts)
  line_type TEXT NOT NULL DEFAULT 'base' CHECK (line_type IN ('base', 'delivery', 'haul', 'extra_days', 'tax', 'discount', 'adjustment')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, quote_id)
);

-- ============================================
-- BOOKING REQUESTS & BOOKINGS
-- ============================================

-- Booking Requests (pending admin approval)
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'modified_awaiting_customer')),
  customer_inputs JSONB NOT NULL DEFAULT '{}'::jsonb, -- gate code, instructions, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dumpsters (inventory)
CREATE TABLE dumpsters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  size INT NOT NULL CHECK (size IN (10, 15, 20, 30, 40)),
  type TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'dropped', 'maintenance', 'retired')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, unit_number)
);

-- Bookings (confirmed)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
  dumpster_id UUID REFERENCES dumpsters(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'scheduled', 'dropped', 'picked_up', 'completed', 'cancelled')),
  dropoff_scheduled_at TIMESTAMPTZ,
  pickup_due_at TIMESTAMPTZ,
  dropped_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  pricing_snapshot JSONB NOT NULL, -- copy of quote snapshot
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INVOICES & PAYMENTS
-- ============================================

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'void', 'refunded', 'partial')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subtotal INT NOT NULL, -- cents
  total INT NOT NULL, -- cents
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, invoice_number)
);

-- Invoice Line Items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price INT NOT NULL, -- cents
  amount INT NOT NULL, -- cents
  line_type TEXT NOT NULL DEFAULT 'base' CHECK (line_type IN ('base', 'delivery', 'haul', 'extra_days', 'tax', 'discount', 'adjustment')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stripe Customers
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  default_payment_method_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, customer_id)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT NOT NULL,
  amount INT NOT NULL, -- cents
  status TEXT NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DUMP TICKETS & ADJUSTMENTS
-- ============================================

-- Dump Tickets (for tonnage tracking)
CREATE TABLE dump_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  facility TEXT NOT NULL,
  ticket_number TEXT NOT NULL,
  net_tons NUMERIC(6,2) NOT NULL,
  ticket_datetime TIMESTAMPTZ NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adjustments (overage charges)
CREATE TABLE adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('tonnage_overage', 'late_fee', 'other')),
  amount INT NOT NULL, -- cents
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'charged', 'failed', 'void')),
  stripe_payment_intent_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUDIT LOG (optional but recommended)
-- ============================================

CREATE TABLE events_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_business_users_user_id ON business_users(user_id);
CREATE INDEX idx_business_users_business_id ON business_users(business_id);
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_addresses_business_id ON addresses(business_id);
CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX idx_service_areas_business_id ON service_areas(business_id);
CREATE INDEX idx_pricing_rules_business_id ON pricing_rules(business_id);
CREATE INDEX idx_quotes_business_id ON quotes(business_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_address_id ON quotes(address_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_booking_requests_business_id ON booking_requests(business_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_invoices_business_id ON invoices(business_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_adjustments_booking_id ON adjustments(booking_id);
CREATE INDEX idx_adjustments_status ON adjustments(status);
CREATE INDEX idx_events_audit_entity ON events_audit(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dumpsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dump_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_audit ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper function to check if user is admin for a business
CREATE OR REPLACE FUNCTION is_business_admin(check_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM business_users
    WHERE user_id = auth.uid()
    AND business_id = check_business_id
    AND role IN ('owner', 'admin', 'dispatcher', 'accounting')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is any business member
CREATE OR REPLACE FUNCTION is_business_member(check_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM business_users
    WHERE user_id = auth.uid()
    AND business_id = check_business_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business Users: users can read their own membership
CREATE POLICY "Users can view their own business memberships"
  ON business_users FOR SELECT
  USING (user_id = auth.uid());

-- Business Users: admins can manage their business's users
CREATE POLICY "Admins can manage business users"
  ON business_users FOR ALL
  USING (is_business_admin(business_id));

-- Businesses: members can read their business
CREATE POLICY "Members can view their business"
  ON businesses FOR SELECT
  USING (is_business_member(id));

-- Admins can manage their business
CREATE POLICY "Admins can manage their business"
  ON businesses FOR ALL
  USING (is_business_admin(id));

-- Business Settings: admins can manage
CREATE POLICY "Admins can manage business settings"
  ON business_settings FOR ALL
  USING (is_business_admin(business_id));

-- Customers: users can read their own customer record
CREATE POLICY "Users can view their own customer record"
  ON customers FOR SELECT
  USING (user_id = auth.uid());

-- Customers: admins can manage all customers
CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  USING (is_business_admin(business_id));

-- Addresses: users can view addresses linked to their customer record
CREATE POLICY "Users can view their addresses"
  ON addresses FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Addresses: admins can manage all addresses
CREATE POLICY "Admins can manage addresses"
  ON addresses FOR ALL
  USING (is_business_admin(business_id));

-- Service Areas: anyone can read active service areas (public)
CREATE POLICY "Anyone can view active service areas"
  ON service_areas FOR SELECT
  USING (active = TRUE);

-- Service Areas: admins can manage
CREATE POLICY "Admins can manage service areas"
  ON service_areas FOR ALL
  USING (is_business_admin(business_id));

-- Pricing Rules: anyone can read active pricing (public)
CREATE POLICY "Anyone can view active pricing"
  ON pricing_rules FOR SELECT
  USING (active = TRUE);

-- Pricing Rules: admins can manage
CREATE POLICY "Admins can manage pricing rules"
  ON pricing_rules FOR ALL
  USING (is_business_admin(business_id));

-- Quotes: users can view quotes linked to their customer record
CREATE POLICY "Users can view their quotes"
  ON quotes FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Quotes: admins can manage all quotes
CREATE POLICY "Admins can manage quotes"
  ON quotes FOR ALL
  USING (is_business_admin(business_id));

-- Quote Line Items: inherit from quote access
CREATE POLICY "Users can view their quote line items"
  ON quote_line_items FOR SELECT
  USING (
    quote_id IN (
      SELECT id FROM quotes
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage quote line items"
  ON quote_line_items FOR ALL
  USING (
    quote_id IN (SELECT id FROM quotes WHERE is_business_admin(business_id))
  );

-- Carts: users can manage their own carts
CREATE POLICY "Users can manage their carts"
  ON carts FOR ALL
  USING (user_id = auth.uid());

-- Cart Items: users can manage their own cart items
CREATE POLICY "Users can manage their cart items"
  ON cart_items FOR ALL
  USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Booking Requests: users can view their own
CREATE POLICY "Users can view their booking requests"
  ON booking_requests FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Booking Requests: admins can manage
CREATE POLICY "Admins can manage booking requests"
  ON booking_requests FOR ALL
  USING (is_business_admin(business_id));

-- Dumpsters: admins can manage
CREATE POLICY "Admins can manage dumpsters"
  ON dumpsters FOR ALL
  USING (is_business_admin(business_id));

-- Dumpsters: members can view (for scheduling)
CREATE POLICY "Members can view dumpsters"
  ON dumpsters FOR SELECT
  USING (is_business_member(business_id));

-- Bookings: users can view their own
CREATE POLICY "Users can view their bookings"
  ON bookings FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Bookings: admins can manage
CREATE POLICY "Admins can manage bookings"
  ON bookings FOR ALL
  USING (is_business_admin(business_id));

-- Invoices: users can view their own
CREATE POLICY "Users can view their invoices"
  ON invoices FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Invoices: admins can manage
CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  USING (is_business_admin(business_id));

-- Invoice Line Items: inherit from invoice access
CREATE POLICY "Users can view their invoice line items"
  ON invoice_line_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage invoice line items"
  ON invoice_line_items FOR ALL
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE is_business_admin(business_id))
  );

-- Stripe Customers: admins can manage
CREATE POLICY "Admins can manage stripe customers"
  ON stripe_customers FOR ALL
  USING (is_business_admin(business_id));

-- Payments: users can view their own
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices
      WHERE customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
  );

-- Payments: admins can manage
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (
    invoice_id IN (SELECT id FROM invoices WHERE is_business_admin(business_id))
  );

-- Dump Tickets: admins can manage
CREATE POLICY "Admins can manage dump tickets"
  ON dump_tickets FOR ALL
  USING (
    booking_id IN (SELECT id FROM bookings WHERE is_business_admin(business_id))
  );

-- Adjustments: users can view their own
CREATE POLICY "Users can view their adjustments"
  ON adjustments FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Adjustments: admins can manage
CREATE POLICY "Admins can manage adjustments"
  ON adjustments FOR ALL
  USING (is_business_admin(business_id));

-- Events Audit: admins can view
CREATE POLICY "Admins can view audit events"
  ON events_audit FOR SELECT
  USING (is_business_admin(business_id));

-- Events Audit: admins can insert
CREATE POLICY "Admins can create audit events"
  ON events_audit FOR INSERT
  WITH CHECK (is_business_admin(business_id));

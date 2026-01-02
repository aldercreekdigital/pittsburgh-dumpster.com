-- Seed Data for McCrackan Roll-Off Service
-- All prices in cents

-- ============================================
-- ADMIN USER SETUP
-- ============================================
-- After seeding, create an admin user:
-- 1. Sign up at /signup with your email
-- 2. Run this SQL in Supabase dashboard (SQL Editor):
--
--    INSERT INTO business_users (business_id, user_id, role)
--    SELECT '00000000-0000-0000-0000-000000000001', id, 'owner'
--    FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';
--
-- ============================================

-- ============================================
-- BUSINESS
-- ============================================

INSERT INTO businesses (id, name, phone, email, address)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'McCrackan Roll-Off Service',
  '412-965-2791',
  'gmurin@icloud.com',
  '1555 Oakdale Road, Oakdale, PA 15071'
);

-- ============================================
-- BUSINESS SETTINGS
-- ============================================

INSERT INTO business_settings (business_id, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '{
    "quote_expiration_days": 7,
    "notification_emails": ["gmurin@icloud.com"],
    "terms_text": "By proceeding, you agree to our rental terms and conditions. Dumpsters must be accessible for delivery and pickup. No hazardous materials allowed.",
    "default_included_days": 3
  }'::jsonb
);

-- ============================================
-- SERVICE AREA
-- Polygon covering roughly 1 hour from Oakdale, PA (40.3985, -80.1848)
-- Covers: Pittsburgh metro, parts of WV, parts of OH
-- ============================================

INSERT INTO service_areas (business_id, name, polygon, active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Greater Pittsburgh Area',
  '{
    "type": "Polygon",
    "coordinates": [[
      [-80.9, 40.9],
      [-79.5, 40.9],
      [-79.3, 40.6],
      [-79.4, 40.1],
      [-79.8, 39.8],
      [-80.5, 39.7],
      [-80.9, 39.9],
      [-81.0, 40.3],
      [-80.9, 40.9]
    ]]
  }'::jsonb,
  TRUE
);

-- ============================================
-- PRICING RULES
-- All prices in cents
-- 3 days included, $25/day extra
-- ============================================

-- 10 Yard Dumpster - $350, 1 ton included, $100/ton overage
INSERT INTO pricing_rules (
  business_id, waste_type, dumpster_size,
  base_price, delivery_fee, haul_fee,
  included_days, extra_day_fee,
  included_tons, overage_per_ton,
  public_notes, active
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'household_trash',
  10,
  35000,  -- $350.00
  0,
  0,
  3,
  2500,   -- $25.00/day
  1.00,
  10000,  -- $100.00/ton
  'Perfect for small cleanouts, single room renovations, or garage cleanups. Holds about 3 pickup truck loads.',
  TRUE
),
(
  '00000000-0000-0000-0000-000000000001',
  'construction_debris',
  10,
  35000,  -- $350.00
  0,
  0,
  3,
  2500,   -- $25.00/day
  1.00,
  10000,  -- $100.00/ton
  'Perfect for small renovations or construction cleanups. Holds about 3 pickup truck loads.',
  TRUE
);

-- 15 Yard Dumpster - $399, 1 ton included, $100/ton overage
INSERT INTO pricing_rules (
  business_id, waste_type, dumpster_size,
  base_price, delivery_fee, haul_fee,
  included_days, extra_day_fee,
  included_tons, overage_per_ton,
  public_notes, active
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'household_trash',
  15,
  39900,  -- $399.00
  0,
  0,
  3,
  2500,   -- $25.00/day
  1.00,
  10000,  -- $100.00/ton
  'Great for medium projects like basement cleanouts or deck removals. Holds about 4-5 pickup truck loads.',
  TRUE
),
(
  '00000000-0000-0000-0000-000000000001',
  'construction_debris',
  15,
  39900,  -- $399.00
  0,
  0,
  3,
  2500,   -- $25.00/day
  1.00,
  10000,  -- $100.00/ton
  'Ideal for kitchen/bath remodels or roofing projects. Holds about 4-5 pickup truck loads.',
  TRUE
);

-- 20 Yard Dumpster - $500, 2 tons included, $100/ton overage
INSERT INTO pricing_rules (
  business_id, waste_type, dumpster_size,
  base_price, delivery_fee, haul_fee,
  included_days, extra_day_fee,
  included_tons, overage_per_ton,
  public_notes, active
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'household_trash',
  20,
  50000,  -- $500.00
  0,
  0,
  3,
  2500,   -- $25.00/day
  2.00,
  10000,  -- $100.00/ton
  'Best for larger home cleanouts, moving projects, or multi-room renovations. Holds about 6-7 pickup truck loads.',
  TRUE
),
(
  '00000000-0000-0000-0000-000000000001',
  'construction_debris',
  20,
  50000,  -- $500.00
  0,
  0,
  3,
  2500,   -- $25.00/day
  2.00,
  10000,  -- $100.00/ton
  'Perfect for new construction, major renovations, or demolition projects. Holds about 6-7 pickup truck loads.',
  TRUE
);

-- ============================================
-- SAMPLE DUMPSTERS (INVENTORY)
-- ============================================

INSERT INTO dumpsters (business_id, unit_number, size, status, notes)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'D10-001', 10, 'available', NULL),
  ('00000000-0000-0000-0000-000000000001', 'D10-002', 10, 'available', NULL),
  ('00000000-0000-0000-0000-000000000001', 'D15-001', 15, 'available', NULL),
  ('00000000-0000-0000-0000-000000000001', 'D15-002', 15, 'available', NULL),
  ('00000000-0000-0000-0000-000000000001', 'D15-003', 15, 'available', NULL),
  ('00000000-0000-0000-0000-000000000001', 'D20-001', 20, 'available', NULL),
  ('00000000-0000-0000-0000-000000000001', 'D20-002', 20, 'available', NULL);

  -- Create a test customer
  INSERT INTO customers (id, business_id, name, email, phone)
  VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000001',
    'John Smith',
    'john@example.com',
    '412-555-1234'
  );

  -- Create a test address
  INSERT INTO addresses (id, business_id, customer_id, full_address, street, city, state, zip, lat, lng)
  VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '123 Main St, Pittsburgh, PA 15213',
    '123 Main St',
    'Pittsburgh',
    'PA',
    '15213',
    40.4406,
    -79.9959
  );

  -- Create a test quote
  INSERT INTO quotes (id, business_id, address_id, waste_type, dumpster_size, dropoff_date, pickup_date, status, pricing_snapshot)
  VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '00000000-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'household_trash',
    15,
    '2026-01-10',
    '2026-01-13',
    'converted',
    '{"base_price": 39900, "delivery_fee": 0, "haul_fee": 0, "included_days": 3, "extra_day_fee": 2500, "included_tons": 1, "overage_per_ton": 10000, "rental_days": 3, "extra_days": 0, "subtotal": 39900, "total": 39900, "dumpster_size": 15, "waste_type": "household_trash"}'
  );

  -- Create quote line items
  INSERT INTO quote_line_items (quote_id, label, amount, sort_order)
  VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '15 Yard Dumpster - Base Price', 39900, 1);

  -- Create a pending booking request
  INSERT INTO booking_requests (id, business_id, customer_id, quote_id, status, customer_inputs)
  VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'pending',
    '{"contactName": "John Smith", "contactPhone": "412-555-1234", "contactEmail": "john@example.com", "instructions": "Please place in driveway", "gateInfo": {"hasGate": false}}'
  );

-- Second Test Data Iteration
  -- Second customer
  INSERT INTO customers (id, business_id, name, email, phone)
  VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    '00000000-0000-0000-0000-000000000001',
    'Jane Doe',
    'jane@example.com',
    '412-555-5678'
  );

  -- Second address
  INSERT INTO addresses (id, business_id, customer_id, full_address, street, city, state, zip, lat, lng)
  VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    '456 Oak Ave, Pittsburgh, PA 15232',
    '456 Oak Ave',
    'Pittsburgh',
    'PA',
    '15232',
    40.4528,
    -79.9325
  );

  -- Second quote (20 yard, construction debris)
  INSERT INTO quotes (id, business_id, address_id, waste_type, dumpster_size, dropoff_date, pickup_date, status, pricing_snapshot)
  VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccd',
    '00000000-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
    'construction_debris',
    20,
    '2026-01-15',
    '2026-01-20',
    'draft',
    '{"base_price": 50000, "delivery_fee": 0, "haul_fee": 0, "included_days": 3, "extra_day_fee": 2500, "included_tons": 2, "overage_per_ton": 10000, "rental_days": 5, "extra_days": 2, "subtotal": 55000, "total": 55000, "dumpster_size": 20, "waste_type": "construction_debris"}'
  );

  -- Second quote line items
  INSERT INTO quote_line_items (quote_id, label, amount, sort_order)
  VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccccd', '20 Yard Dumpster - Base Price', 50000, 1),
    ('cccccccc-cccc-cccc-cccc-cccccccccccd', 'Extra Days (2 x $25)', 5000, 2);

  -- Second pending booking request
  INSERT INTO booking_requests (id, business_id, customer_id, quote_id, status, customer_inputs)
  VALUES (
    'dddddddd-dddd-dddd-dddd-ddddddddddde',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    'cccccccc-cccc-cccc-cccc-cccccccccccd',
    'pending',
    '{"contactName": "Jane Doe", "contactPhone": "412-555-5678", "contactEmail": "jane@example.com", "instructions": "Gate code is 1234", "gateInfo": {"hasGate": true, "gateCode": "1234"}}'
  );

  -- Third customer (10 yard)
  INSERT INTO customers (id, business_id, name, email, phone)
  VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    '00000000-0000-0000-0000-000000000001',
    'Bob Wilson',
    'bob@example.com',
    '412-555-9999'
  );

  -- Third address
  INSERT INTO addresses (id, business_id, customer_id, full_address, street, city, state, zip, lat, lng)
  VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbd',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    '789 Elm St, Oakdale, PA 15071',
    '789 Elm St',
    'Oakdale',
    'PA',
    '15071',
    40.3985,
    -80.1848
  );

  -- Third quote (10 yard)
  INSERT INTO quotes (id, business_id, address_id, waste_type, dumpster_size, dropoff_date, pickup_date, status, pricing_snapshot)
  VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccce',
    '00000000-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbd',
    'household_trash',
    10,
    '2026-01-08',
    '2026-01-11',
    'draft',
    '{"base_price": 35000, "delivery_fee": 0, "haul_fee": 0, "included_days": 3, "extra_day_fee": 2500, "included_tons": 1, "overage_per_ton": 10000, "rental_days": 3, "extra_days": 0, "subtotal": 35000, "total": 35000, "dumpster_size": 10, "waste_type": "household_trash"}'
  );

  -- Third quote line items
  INSERT INTO quote_line_items (quote_id, label, amount, sort_order)
  VALUES
    ('cccccccc-cccc-cccc-cccc-cccccccccce', '10 Yard Dumpster - Base Price', 35000, 1);

  -- Third pending booking request
  INSERT INTO booking_requests (id, business_id, customer_id, quote_id, status, customer_inputs)
  VALUES (
    'dddddddd-dddd-dddd-dddd-ddddddddddf',
    '00000000-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    'cccccccc-cccc-cccc-cccc-cccccccccce',
    'pending',
    '{"contactName": "Bob Wilson", "contactPhone": "412-555-9999", "contactEmail": "bob@example.com", "instructions": "", "gateInfo": {"hasGate": false}}'
  );
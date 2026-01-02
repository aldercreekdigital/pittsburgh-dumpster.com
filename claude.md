# CLAUDE.md — Pittsburgh Dumpster Booking + Admin (Next.js + Supabase + Stripe)

This document is the implementation playbook. Follow it in order. Each step must be implementable and testable before moving on.



## Core Decisions (locked)
1) Customer pays full amount upfront at checkout (no delayed payment).
2) Pricing snapshots must be persisted on quote/booking/invoice to prevent future config changes from affecting historical transactions.
3) Separate BookingRequest (pending approval) from Booking (confirmed) is required.
4) Stripe Customer ID + saved payment method for off-session overage charges is required.

UI Examples from waste managements booking system can be found in /docs/screenshots for reference.
---

# 0. Technical stack + repo structure

## Stack
- Next.js (App Router)
- Supabase (Postgres + Auth + Storage + RLS)
- Stripe (Checkout + webhooks + off-session charges for overages)
- Map provider: start with Mapbox or Google Maps (choose one), but isolate behind a component.

## Suggested folders
- /app
  - /(public)
    - booking/page.tsx
    - dumpster-sizes/page.tsx
    - cart/page.tsx
    - checkout/page.tsx
    - pay/success/page.tsx
    - pay/cancel/page.tsx
  - /(admin)
    - admin/layout.tsx
    - admin/page.tsx
    - admin/requests/page.tsx
    - admin/requests/[id]/page.tsx
    - admin/bookings/page.tsx
    - admin/bookings/[id]/page.tsx
    - admin/invoices/page.tsx
    - admin/invoices/[id]/page.tsx
    - admin/dumpsters/page.tsx
    - admin/settings/page.tsx
- /lib
  - supabase/server.ts
  - supabase/client.ts
  - stripe/server.ts
  - pricing/engine.ts
  - geo/serviceability.ts
  - invoices/pdf.ts
  - email/send.ts
- /supabase
  - migrations/*.sql
  - seed.sql

---

# 1. Data model (v1 single business, SaaS-ready)

Everything includes business_id even if we only have one business initially.

## Tables (minimum viable set)
- businesses
- business_users
- customers
- addresses
- service_areas (polygons)
- pricing_rules
- quotes
- quote_line_items
- carts
- cart_items
- booking_requests
- bookings
- invoices
- invoice_line_items
- stripe_customers
- payments
- dumpsters (admin config + assignment later)
- dump_tickets (for tonnage)
- adjustments (overage charges)
- events_audit (optional but recommended)

## Migration step
Create SQL migrations in /supabase/migrations:
- 0001_init.sql — create tables + indexes
- 0002_rls.sql — enable RLS + base policies
- 0003_seed.sql — seed one business, one admin user, pricing rules, service area

### Required columns (high signal)
#### businesses
- id uuid pk
- name text
- phone text
- email text
- created_at timestamptz

#### business_users
- id uuid pk
- business_id uuid fk
- user_id uuid (auth.users)
- role text check in ('owner','admin','dispatcher','accounting','driver','read_only')
- created_at timestamptz
Unique (business_id, user_id)

#### customers
- id uuid pk
- business_id uuid fk
- user_id uuid nullable (auth uid)
- name text
- email text
- phone text
- created_at timestamptz
Unique (business_id, email)

#### addresses
- id uuid pk
- business_id uuid fk
- customer_id uuid nullable
- full_address text
- street text
- city text
- state text
- zip text
- lat double precision
- lng double precision
- place_id text nullable
- created_at timestamptz

#### service_areas
- id uuid pk
- business_id uuid fk
- name text
- polygon jsonb  // geojson polygon
- active bool default true

#### pricing_rules
- id uuid pk
- business_id uuid fk
- waste_type text check in ('construction_debris','household_trash')
- dumpster_size int check in (10,15,20,30,40)
- base_price int  // cents
- delivery_fee int // cents
- haul_fee int // cents
- included_days int
- extra_day_fee int // cents/day
- included_tons numeric(6,2)
- overage_per_ton int // cents/ton
- public_notes text
- active bool default true
Unique (business_id, waste_type, dumpster_size, active) partial or enforce only one active per combo.

#### quotes
- id uuid pk
- business_id uuid fk
- address_id uuid fk
- waste_type text
- dumpster_size int
- dropoff_date date
- pickup_date date
- status text check in ('draft','sent','expired','converted')
- expires_at timestamptz
- pricing_snapshot jsonb  // LOCKED numbers in cents + included days/tons
- created_at timestamptz

#### quote_line_items
- id uuid pk
- quote_id uuid fk
- label text
- amount int // cents (can be negative for discounts)
- sort_order int

#### carts
- id uuid pk
- business_id uuid fk
- user_id uuid fk auth.users
- status text check in ('active','abandoned','converted')
- created_at timestamptz

#### cart_items
- id uuid pk
- cart_id uuid fk
- quote_id uuid fk

#### booking_requests
- id uuid pk
- business_id uuid fk
- customer_id uuid fk
- quote_id uuid fk
- status text check in ('pending','approved','declined','modified_awaiting_customer')
- customer_inputs jsonb // gate code, instructions, etc.
- created_at timestamptz

#### bookings
- id uuid pk
- business_id uuid fk
- booking_request_id uuid fk
- customer_id uuid fk
- address_id uuid fk
- dumpster_id uuid nullable fk
- status text check in ('confirmed','scheduled','dropped','picked_up','completed','cancelled')
- dropoff_scheduled_at timestamptz nullable
- pickup_due_at timestamptz nullable
- dropped_at timestamptz nullable
- picked_up_at timestamptz nullable
- pricing_snapshot jsonb // copy of quote snapshot
- created_at timestamptz

#### invoices
- id uuid pk
- business_id uuid fk
- customer_id uuid fk
- booking_id uuid fk
- invoice_number text
- status text check in ('unpaid','paid','void','refunded','partial')
- issued_at timestamptz
- subtotal int
- total int
- stripe_checkout_session_id text nullable
- stripe_payment_intent_id text nullable
- created_at timestamptz
Unique (business_id, invoice_number)

#### invoice_line_items
- id uuid pk
- invoice_id uuid fk
- label text
- quantity int default 1
- unit_price int // cents
- amount int // cents
- type text check in ('base','delivery','haul','extra_days','tax','discount','adjustment')

#### stripe_customers
- id uuid pk
- business_id uuid fk
- customer_id uuid fk
- stripe_customer_id text
- default_payment_method_id text nullable
Unique (business_id, customer_id)

#### payments
- id uuid pk
- invoice_id uuid fk
- stripe_payment_intent_id text
- amount int
- status text
- receipt_url text nullable
- created_at timestamptz

#### dumpsters
- id uuid pk
- business_id uuid fk
- unit_number text
- size int
- type text nullable
- status text check in ('available','reserved','dropped','maintenance','retired')
- notes text nullable
Unique (business_id, unit_number)

#### dump_tickets
- id uuid pk
- booking_id uuid fk
- facility text
- ticket_number text
- net_tons numeric(6,2)
- ticket_datetime timestamptz
- attachment_url text nullable

#### adjustments (overage charges)
- id uuid pk
- business_id uuid fk
- booking_id uuid fk
- customer_id uuid fk
- kind text check in ('tonnage_overage','late_fee','other')
- amount int // cents
- status text check in ('pending','charged','failed','void')
- stripe_payment_intent_id text nullable
- notes text nullable
- created_at timestamptz

---

# 2. Security (RLS) — do this early

## Rules
- Public users can create quotes and booking_requests but only read their own (via user_id linking).
- Admin users (business_users) can read/write everything for their business.

### Implementation approach (v1)
- All public actions that write sensitive data happen through server actions / route handlers using Supabase service role key (server-side only).
- Client-side Supabase is used for auth session + reading the logged-in user's own records.
- RLS still enforced for safety; service role bypass is used only in server routes.

### Required policies
- business_users: user can read their own membership rows
- customers/addresses/quotes/booking_requests/bookings/invoices: user can read rows where customer.user_id = auth.uid()
- admins: allow CRUD where exists (select 1 from business_users where user_id=auth.uid() and business_id = row.business_id)

---

# 3. Pricing engine (pure function) — test first

Create /lib/pricing/engine.ts

Input:
- pricing_rule
- dropoff_date, pickup_date

Output:
- pricing_snapshot {
  base_price, delivery_fee, haul_fee,
  included_days, extra_day_fee,
  included_tons, overage_per_ton,
  rental_days, extra_days,
  subtotal, total,
  notes
}
- line_items[] {label, amount, type, sort_order}

Rules:
- rental_days = (pickup_date - dropoff_date) in days (inclusive/exclusive: decide and lock)
  - Recommended: count full calendar days between dates, pickup_date must be >= dropoff_date.
- extra_days = max(0, rental_days - included_days)
- total = base + delivery + haul + extra_days*extra_day_fee
- store all money in cents (ints)

Tests:
- unit test pricing engine with multiple date ranges.
- verify extra day calculations.

Deliverable:
- Passing unit tests.
- No DB or UI yet.

---

# 4. Serviceability check (geo) — test second

Create /lib/geo/serviceability.ts
- function isInServiceArea(point, polygons): boolean
- polygon stored as GeoJSON in DB

Use a known point-in-polygon implementation (keep it deterministic).
Tests:
- seed polygon for Pittsburgh area
- verify an inside address returns true, outside returns false

---

# 5. Public Flow Step-by-step implementation

## Step 5.1 /booking page
UI:
- Address input with autocomplete (Google Places or Mapbox)
- Submit button

Server route:
- POST /api/quote/start
  - Accept address payload + lat/lng + normalized fields
  - Verify serviceability using polygons in DB
  - If not serviceable: return {ok:false, reason}
  - If serviceable:
    - create address row
    - create quote row status=draft with address_id
    - return {ok:true, quoteId}

Client:
- on success redirect /dumpster-sizes?quote=...

Tests:
- serviceable address creates quote
- unserviceable returns error and UI highlights input red

## Step 5.2 /dumpster-sizes page
UI:
- waste type dropdown
- dumpster size radio list (fetch active pricing_rules)
- dropoff + pickup date
- live quote price display (calls API or client computes after fetching rule)

Server route:
- POST /api/quote/configure
  - Validate inputs
  - Load pricing_rule for (waste_type, size)
  - Run pricing engine
  - Update quote:
    - waste_type, dumpster_size, dates
    - pricing_snapshot jsonb
    - upsert quote_line_items from pricing engine output
  - return updated quote summary

Actions:
- Send Quote
  - POST /api/quote/send
    - generate PDF from quote snapshot
    - email customer (allow email field prompt)
    - set quote status=sent, expires_at
- Add to Cart
  - If not logged in -> redirect to /login?next=/cart
  - If logged in -> POST /api/cart/add with quoteId
    - create cart if none active
    - create cart_item

Tests:
- quote configure calculates correctly and persists snapshot + line items
- send quote produces a PDF (placeholder ok initially) + emails are logged (use dev sink)
- add to cart creates cart + cart item

---

# 6. Auth + customer profile link

Requirement:
- Once user signs up, associate them to a customer row.

On signup/login redirect to /cart
- If customer row missing for this business:
  - Create customer row using auth user email + name if available
  - Link customer.user_id = auth.uid()

Implement as:
- Server route POST /api/customer/ensure
Called from /cart layout when session exists.

Test:
- New user creates customer row automatically.

---

# 7. Cart + Checkout + Booking Request creation

## Step 7.1 /cart
- Show active cart items with quote summaries
- Button: Checkout -> /checkout?cart=...

## Step 7.2 /checkout
UI fields:
- contact name, phone (email from auth)
- instructions textarea
- gate checkbox + gate code or call number requirement
- confirm terms checkbox

Server route:
- POST /api/booking-request/create
  - Validate session + ensure customer exists
  - Validate cart has 1 quote (v1 can be single-item cart)
  - Validate quote not expired and has pricing_snapshot
  - Create booking_request status=pending with customer_inputs jsonb
  - Return booking_request_id

Email provider:
- Send request summary to business notification recipients
- Include admin link /admin/requests/:id

Tests:
- booking_request created
- provider email sent with correct details

---

# 8. Admin backend MVP (requests first)

## Step 8.1 Admin auth + role check
- /admin routes require business_users role
- Implement middleware or layout guard (server-side)
- If unauthorized -> redirect /login or 403

Test:
- non-admin blocked
- admin allowed

## Step 8.2 /admin/requests list + detail
List columns:
- customer, address, dates, size, total, status

Detail page:
- View request details
- Actions:
  - Approve (creates booking + invoice + Stripe checkout link)
  - Modify (edits request/quote, sets status=modified_awaiting_customer, emails customer to accept changes)
  - Decline (sets status, emails customer)

Note: For v1 simplicity, allow Modify that directly updates quote + pricing snapshot and then sends customer "changes confirmed + proceed to payment" in a single step if you want phone flow. But keep statuses in place.

Tests:
- approve creates booking + invoice
- modify changes quote snapshot + re-prices
- decline sets state and emails

---

# 9. Payment (full amount upfront)

Decision: payment happens after admin approval, but customer must pay immediately (no later invoicing).

## Step 9.1 Approve -> create Stripe Checkout Session
Server route:
- POST /api/payments/create-checkout
  - Input: invoiceId
  - Ensure invoice belongs to customer and status=unpaid
  - Ensure stripe customer exists:
    - if none, create Stripe customer, store stripe_customer_id
  - Create checkout session:
    - mode=payment
    - customer=stripe_customer_id
    - line_items from invoice_line_items
    - success_url=/pay/success?invoice=...
    - cancel_url=/pay/cancel?invoice=...
    - metadata: {invoice_id, business_id, customer_id}
    - payment_intent_data: {setup_future_usage:'off_session'}
  - Save session id on invoice
  - Return checkout_url

Customer email includes checkout_url.

Test:
- checkout session created
- invoice updated with session id
- can open checkout url

## Step 9.2 Stripe webhooks
Route handler: /api/stripe/webhook
Listen for:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed

On success:
- mark invoice status=paid
- store payment intent id, receipt URL if present
- create payments row
- create booking status=confirmed (or "scheduled" depending on your lifecycle)
- email customer + provider confirmation

Tests:
- local webhook testing via Stripe CLI triggers invoice update
- emails fire

---

# 10. Booking lifecycle (drop/pickup) + map later

Implement admin-only booking updates:
- mark dropped_at
- mark picked_up_at
- set status transitions

Add optional map pins once you store booking address lat/lng and status.

Tests:
- transitions are enforced (can’t pick up before dropped unless admin override)

---

# 11. Overage charges (admin later, off-session)

Decision: Overages are charged later by admin using saved payment method.

## Step 11.1 Record dump ticket
Admin enters:
- net_tons
- ticket info

Server:
- compute overage tons from booking.pricing_snapshot.included_tons
- amount = overage_tons * overage_per_ton

Create adjustment row status=pending.

## Step 11.2 Charge overage (off-session)
Admin clicks "Charge card" on adjustment.

Server route:
- POST /api/adjustments/charge
  - Validate admin
  - Load adjustment + customer stripe_customer_id
  - Retrieve default payment method OR require one exists
  - Create payment intent:
    - amount=adjustment.amount
    - currency=usd
    - customer=stripe_customer_id
    - payment_method=default_payment_method_id (or Stripe default)
    - off_session=true
    - confirm=true
    - metadata includes booking/invoice refs
  - On success:
    - adjustment.status=charged
    - store payment_intent_id
    - email receipt to customer + notify provider
  - On failure:
    - adjustment.status=failed
    - store failure code/message
    - email customer "payment failed" with call-to-action

Tests:
- can create pending adjustment from dump ticket
- can charge off-session in Stripe test mode
- failures are handled

---

# 12. PDF generation (quote + invoice)

Implement minimal first:
- Quote PDF: address, dates, size, waste type, line items, total, expiration
- Invoice PDF: invoice number, paid/unpaid, line items, payment info

Store PDFs in Supabase Storage:
- /quotes/{quoteId}.pdf
- /invoices/{invoiceId}.pdf

Tests:
- PDF bytes generated
- file stored
- download link works for authorized users

---

# 13. Admin Settings (replace config file)

Implement settings in DB so later SaaS can manage each business.
Create table:
- business_settings (business_id, jsonb settings)

Store:
- quote_expiration_days
- notification_emails[]
- terms_text
- service_area behavior flags
- etc.

Admin UI:
- /admin/settings
- edit settings
- ensure changes do NOT affect existing quotes/bookings due to snapshots.

Test:
- update settings affects new quotes only (not existing snapshots)

---

# 14. Testing checklist per milestone

## Milestone A: Quote flow works
- Address validation + serviceability
- Quote pricing snapshot stored
- Send quote email + PDF stored

## Milestone B: Booking request works
- Auth
- Cart
- Checkout details
- Booking request pending approval
- Provider email delivered

## Milestone C: Approve -> pay -> confirm works
- Approve creates booking + invoice
- Customer pays via Stripe Checkout
- Webhook marks invoice paid
- Confirmation emails sent

## Milestone D: Overage charging works
- Admin records dump ticket
- Adjustment created
- Off-session charge succeeds
- Failures handled

---

# 15. Non-negotiable implementation notes
- All prices stored in cents (int). Never float for money.
- Always persist pricing_snapshot before allowing checkout.
- Never recalc historical totals from current settings; rely on snapshots.
- Stripe webhooks must verify signature.
- Admin routes must be server-protected (not just client checks).
- Email send should be abstracted so you can swap providers.

---

# 16. Suggested next tasks (start now)
1) Create migrations + seed one business + one admin.
2) Implement pricing engine + unit tests.
3) Implement serviceability check + tests.
4) Build /booking -> /dumpster-sizes with quote creation/configuration.
5) Implement /admin/requests with Approve flow.
6) Integrate Stripe checkout + webhooks.
7) Add adjustments overage flow.

END.




LAUDE.md — Pittsburgh Dumpster Booking + Admin (Next.js + Supabase + Stripe)
This document is the implementation playbook. Follow it in order. Each step must be implementable and testable before moving on.
Core Decisions (locked)
Customer pays full amount upfront at checkout (no delayed payment).
Pricing snapshots must be persisted on quote/booking/invoice to prevent future config changes from affecting historical transactions.
Separate BookingRequest (pending approval) from Booking (confirmed) is required.
Stripe Customer ID + saved payment method for off-session overage charges is required.





0. Technical stack + repo structure
Stack
Next.js (App Router)
Supabase (Postgres + Auth + Storage + RLS)
Stripe (Checkout + webhooks + off-session charges for overages)
Map provider: start with Mapbox or Google Maps (choose one), but isolate behind a component.
Suggested folders
/app
/(public)
booking/page.tsx
dumpster-sizes/page.tsx
cart/page.tsx
checkout/page.tsx
pay/success/page.tsx
pay/cancel/page.tsx
/(admin)
admin/layout.tsx
admin/page.tsx
admin/requests/page.tsx
admin/requests/[id]/page.tsx
admin/bookings/page.tsx
admin/bookings/[id]/page.tsx
admin/invoices/page.tsx
admin/invoices/[id]/page.tsx
admin/dumpsters/page.tsx
admin/settings/page.tsx
/lib
supabase/server.ts
supabase/client.ts
stripe/server.ts
pricing/engine.ts
geo/serviceability.ts
invoices/pdf.ts
email/send.ts
/supabase
migrations/*.sql
seed.sql


1. Data model (v1 single business, SaaS-ready)
Everything includes business_id even if we only have one business initially.
Tables (minimum viable set)
businesses
business_users
customers
addresses
service_areas (polygons)
pricing_rules
quotes
quote_line_items
carts
cart_items
booking_requests
bookings
invoices
invoice_line_items
stripe_customers
payments
dumpsters (admin config + assignment later)
dump_tickets (for tonnage)
adjustments (overage charges)
events_audit (optional but recommended)
Migration step
Create SQL migrations in /supabase/migrations:

0001_init.sql — create tables + indexes
0002_rls.sql — enable RLS + base policies
0003_seed.sql — seed one business, one admin user, pricing rules, service area
Required columns (high signal)
businesses
id uuid pk
name text
phone text
email text
created_at timestamptz
business_users
id uuid pk
business_id uuid fk
user_id uuid (auth.users)
role text check in ('owner','admin','dispatcher','accounting','driver','read_only')
created_at timestamptz Unique (business_id, user_id)
customers
id uuid pk
business_id uuid fk
user_id uuid nullable (auth uid)
name text
email text
phone text
created_at timestamptz Unique (business_id, email)
addresses
id uuid pk
business_id uuid fk
customer_id uuid nullable
full_address text
street text
city text
state text
zip text
lat double precision
lng double precision
place_id text nullable
created_at timestamptz
service_areas
id uuid pk
business_id uuid fk
name text
polygon jsonb  // geojson polygon
active bool default true
pricing_rules
id uuid pk
business_id uuid fk
waste_type text check in ('construction_debris','household_trash')
dumpster_size int check in (10,15,20,30,40)
base_price int  // cents
delivery_fee int // cents
haul_fee int // cents
included_days int
extra_day_fee int // cents/day
included_tons numeric(6,2)
overage_per_ton int // cents/ton
public_notes text
active bool default true Unique (business_id, waste_type, dumpster_size, active) partial or enforce only one active per combo.
quotes
id uuid pk
business_id uuid fk
address_id uuid fk
waste_type text
dumpster_size int
dropoff_date date
pickup_date date
status text check in ('draft','sent','expired','converted')
expires_at timestamptz
pricing_snapshot jsonb  // LOCKED numbers in cents + included days/tons
created_at timestamptz
quote_line_items
id uuid pk
quote_id uuid fk
label text
amount int // cents (can be negative for discounts)
sort_order int
carts
id uuid pk
business_id uuid fk
user_id uuid fk auth.users
status text check in ('active','abandoned','converted')
created_at timestamptz
cart_items
id uuid pk
cart_id uuid fk
quote_id uuid fk
booking_requests
id uuid pk
business_id uuid fk
customer_id uuid fk
quote_id uuid fk
status text check in ('pending','approved','declined','modified_awaiting_customer')
customer_inputs jsonb // gate code, instructions, etc.
created_at timestamptz
bookings
id uuid pk
business_id uuid fk
booking_request_id uuid fk
customer_id uuid fk
address_id uuid fk
dumpster_id uuid nullable fk
status text check in ('confirmed','scheduled','dropped','picked_up','completed','cancelled')
dropoff_scheduled_at timestamptz nullable
pickup_due_at timestamptz nullable
dropped_at timestamptz nullable
picked_up_at timestamptz nullable
pricing_snapshot jsonb // copy of quote snapshot
created_at timestamptz
invoices
id uuid pk
business_id uuid fk
customer_id uuid fk
booking_id uuid fk
invoice_number text
status text check in ('unpaid','paid','void','refunded','partial')
issued_at timestamptz
subtotal int
total int
stripe_checkout_session_id text nullable
stripe_payment_intent_id text nullable
created_at timestamptz Unique (business_id, invoice_number)
invoice_line_items
id uuid pk
invoice_id uuid fk
label text
quantity int default 1
unit_price int // cents
amount int // cents
type text check in ('base','delivery','haul','extra_days','tax','discount','adjustment')
stripe_customers
id uuid pk
business_id uuid fk
customer_id uuid fk
stripe_customer_id text
default_payment_method_id text nullable Unique (business_id, customer_id)
payments
id uuid pk
invoice_id uuid fk
stripe_payment_intent_id text
amount int
status text
receipt_url text nullable
created_at timestamptz
dumpsters
id uuid pk
business_id uuid fk
unit_number text
size int
type text nullable
status text check in ('available','reserved','dropped','maintenance','retired')
notes text nullable Unique (business_id, unit_number)
dump_tickets
id uuid pk
booking_id uuid fk
facility text
ticket_number text
net_tons numeric(6,2)
ticket_datetime timestamptz
attachment_url text nullable
adjustments (overage charges)
id uuid pk
business_id uuid fk
booking_id uuid fk
customer_id uuid fk
kind text check in ('tonnage_overage','late_fee','other')
amount int // cents
status text check in ('pending','charged','failed','void')
stripe_payment_intent_id text nullable
notes text nullable
created_at timestamptz


2. Security (RLS) — do this early
Rules
Public users can create quotes and booking_requests but only read their own (via user_id linking).
Admin users (business_users) can read/write everything for their business.
Implementation approach (v1)
All public actions that write sensitive data happen through server actions / route handlers using Supabase service role key (server-side only).
Client-side Supabase is used for auth session + reading the logged-in user's own records.
RLS still enforced for safety; service role bypass is used only in server routes.
Required policies
business_users: user can read their own membership rows
customers/addresses/quotes/booking_requests/bookings/invoices: user can read rows where customer.user_id = auth.uid()
admins: allow CRUD where exists (select 1 from business_users where user_id=auth.uid() and business_id = row.business_id)


3. Pricing engine (pure function) — test first
Create /lib/pricing/engine.ts

Input:

pricing_rule
dropoff_date, pickup_date

Output:

pricing_snapshot { base_price, delivery_fee, haul_fee, included_days, extra_day_fee, included_tons, overage_per_ton, rental_days, extra_days, subtotal, total, notes }
line_items[] {label, amount, type, sort_order}

Rules:

rental_days = (pickup_date - dropoff_date) in days (inclusive/exclusive: decide and lock)
Recommended: count full calendar days between dates, pickup_date must be >= dropoff_date.
extra_days = max(0, rental_days - included_days)
total = base + delivery + haul + extra_days*extra_day_fee
store all money in cents (ints)

Tests:

unit test pricing engine with multiple date ranges.
verify extra day calculations.

Deliverable:

Passing unit tests.
No DB or UI yet.


4. Serviceability check (geo) — test second
Create /lib/geo/serviceability.ts

function isInServiceArea(point, polygons): boolean
polygon stored as GeoJSON in DB

Use a known point-in-polygon implementation (keep it deterministic). Tests:

seed polygon for Pittsburgh area
verify an inside address returns true, outside returns false


5. Public Flow Step-by-step implementation
Step 5.1 /booking page
UI:

Address input with autocomplete (Google Places or Mapbox)
Submit button

Server route:

POST /api/quote/start
Accept address payload + lat/lng + normalized fields
Verify serviceability using polygons in DB
If not serviceable: return {ok:false, reason}
If serviceable:
create address row
create quote row status=draft with address_id
return {ok:true, quoteId}

Client:

on success redirect /dumpster-sizes?quote=...

Tests:

serviceable address creates quote
unserviceable returns error and UI highlights input red
Step 5.2 /dumpster-sizes page
UI:

waste type dropdown
dumpster size radio list (fetch active pricing_rules)
dropoff + pickup date
live quote price display (calls API or client computes after fetching rule)

Server route:

POST /api/quote/configure
Validate inputs
Load pricing_rule for (waste_type, size)
Run pricing engine
Update quote:
waste_type, dumpster_size, dates
pricing_snapshot jsonb
upsert quote_line_items from pricing engine output
return updated quote summary

Actions:

Send Quote
POST /api/quote/send
generate PDF from quote snapshot
email customer (allow email field prompt)
set quote status=sent, expires_at
Add to Cart
If not logged in -> redirect to /login?next=/cart
If logged in -> POST /api/cart/add with quoteId
create cart if none active
create cart_item

Tests:

quote configure calculates correctly and persists snapshot + line items
send quote produces a PDF (placeholder ok initially) + emails are logged (use dev sink)
add to cart creates cart + cart item


6. Auth + customer profile link
Requirement:

Once user signs up, associate them to a customer row.

On signup/login redirect to /cart

If customer row missing for this business:
Create customer row using auth user email + name if available
Link customer.user_id = auth.uid()

Implement as:

Server route POST /api/customer/ensure Called from /cart layout when session exists.

Test:

New user creates customer row automatically.


7. Cart + Checkout + Booking Request creation
Step 7.1 /cart
Show active cart items with quote summaries
Button: Checkout -> /checkout?cart=...
Step 7.2 /checkout
UI fields:

contact name, phone (email from auth)
instructions textarea
gate checkbox + gate code or call number requirement
confirm terms checkbox

Server route:

POST /api/booking-request/create
Validate session + ensure customer exists
Validate cart has 1 quote (v1 can be single-item cart)
Validate quote not expired and has pricing_snapshot
Create booking_request status=pending with customer_inputs jsonb
Return booking_request_id

Email provider:

Send request summary to business notification recipients
Include admin link /admin/requests/:id

Tests:

booking_request created
provider email sent with correct details


8. Admin backend MVP (requests first)
Step 8.1 Admin auth + role check
/admin routes require business_users role
Implement middleware or layout guard (server-side)
If unauthorized -> redirect /login or 403

Test:

non-admin blocked
admin allowed
Step 8.2 /admin/requests list + detail
List columns:

customer, address, dates, size, total, status

Detail page:

View request details
Actions:
Approve (creates booking + invoice + Stripe checkout link)
Modify (edits request/quote, sets status=modified_awaiting_customer, emails customer to accept changes)
Decline (sets status, emails customer)

Note: For v1 simplicity, allow Modify that directly updates quote + pricing snapshot and then sends customer "changes confirmed + proceed to payment" in a single step if you want phone flow. But keep statuses in place.

Tests:

approve creates booking + invoice
modify changes quote snapshot + re-prices
decline sets state and emails


9. Payment (full amount upfront)
Decision: payment happens after admin approval, but customer must pay immediately (no later invoicing).
Step 9.1 Approve -> create Stripe Checkout Session
Server route:

POST /api/payments/create-checkout
Input: invoiceId
Ensure invoice belongs to customer and status=unpaid
Ensure stripe customer exists:
if none, create Stripe customer, store stripe_customer_id
Create checkout session:
mode=payment
customer=stripe_customer_id
line_items from invoice_line_items
success_url=/pay/success?invoice=...
cancel_url=/pay/cancel?invoice=...
metadata: {invoice_id, business_id, customer_id}
payment_intent_data: {setup_future_usage:'off_session'}
Save session id on invoice
Return checkout_url

Customer email includes checkout_url.

Test:

checkout session created
invoice updated with session id
can open checkout url
Step 9.2 Stripe webhooks
Route handler: /api/stripe/webhook Listen for:

checkout.session.completed
payment_intent.succeeded
payment_intent.payment_failed

On success:

mark invoice status=paid
store payment intent id, receipt URL if present
create payments row
create booking status=confirmed (or "scheduled" depending on your lifecycle)
email customer + provider confirmation

Tests:

local webhook testing via Stripe CLI triggers invoice update
emails fire


10. Booking lifecycle (drop/pickup) + map later
Implement admin-only booking updates:

mark dropped_at
mark picked_up_at
set status transitions

Add optional map pins once you store booking address lat/lng and status.

Tests:

transitions are enforced (can’t pick up before dropped unless admin override)


11. Overage charges (admin later, off-session)
Decision: Overages are charged later by admin using saved payment method.
Step 11.1 Record dump ticket
Admin enters:

net_tons
ticket info

Server:

compute overage tons from booking.pricing_snapshot.included_tons
amount = overage_tons * overage_per_ton

Create adjustment row status=pending.
Step 11.2 Charge overage (off-session)
Admin clicks "Charge card" on adjustment.

Server route:

POST /api/adjustments/charge
Validate admin
Load adjustment + customer stripe_customer_id
Retrieve default payment method OR require one exists
Create payment intent:
amount=adjustment.amount
currency=usd
customer=stripe_customer_id
payment_method=default_payment_method_id (or Stripe default)
off_session=true
confirm=true
metadata includes booking/invoice refs
On success:
adjustment.status=charged
store payment_intent_id
email receipt to customer + notify provider
On failure:
adjustment.status=failed
store failure code/message
email customer "payment failed" with call-to-action

Tests:

can create pending adjustment from dump ticket
can charge off-session in Stripe test mode
failures are handled


12. PDF generation (quote + invoice)
Implement minimal first:

Quote PDF: address, dates, size, waste type, line items, total, expiration
Invoice PDF: invoice number, paid/unpaid, line items, payment info

Store PDFs in Supabase Storage:

/quotes/{quoteId}.pdf
/invoices/{invoiceId}.pdf

Tests:

PDF bytes generated
file stored
download link works for authorized users


13. Admin Settings (replace config file)
Implement settings in DB so later SaaS can manage each business. Create table:

business_settings (business_id, jsonb settings)

Store:

quote_expiration_days
notification_emails[]
terms_text
service_area behavior flags
etc.

Admin UI:

/admin/settings
edit settings
ensure changes do NOT affect existing quotes/bookings due to snapshots.

Test:

update settings affects new quotes only (not existing snapshots)


14. Testing checklist per milestone
Milestone A: Quote flow works
Address validation + serviceability
Quote pricing snapshot stored
Send quote email + PDF stored
Milestone B: Booking request works
Auth
Cart
Checkout details
Booking request pending approval
Provider email delivered
Milestone C: Approve -> pay -> confirm works
Approve creates booking + invoice
Customer pays via Stripe Checkout
Webhook marks invoice paid
Confirmation emails sent
Milestone D: Overage charging works
Admin records dump ticket
Adjustment created
Off-session charge succeeds
Failures handled


15. Non-negotiable implementation notes
All prices stored in cents (int). Never float for money.
Always persist pricing_snapshot before allowing checkout.
Never recalc historical totals from current settings; rely on snapshots.
Stripe webhooks must verify signature.
Admin routes must be server-protected (not just client checks).
Email send should be abstracted so you can swap providers.


16. Suggested next tasks (start now)
Create migrations + seed one business + one admin.
Implement pricing engine + unit tests.
Implement serviceability check + tests.
Build /booking -> /dumpster-sizes with quote creation/configuration.
Implement /admin/requests with Approve flow.
Integrate Stripe checkout + webhooks.
Add adjustments overage flow.

END.


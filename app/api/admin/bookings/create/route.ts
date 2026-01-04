import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { calculatePricing, parseDate, PricingRule } from '@/lib/pricing/engine'
import { isInServiceArea } from '@/lib/geo/serviceability'
import { sendEmail, getBookingApprovedHtml } from '@/lib/email/send'
import { randomUUID } from 'crypto'

interface CreateBookingRequest {
  // Address
  address: {
    full_address: string
    street: string
    city: string
    state: string
    zip: string
    lat: number
    lng: number
    place_id?: string
  }
  // Dumpster config
  dumpster_size: number
  waste_type: string
  dropoff_date: string // YYYY-MM-DD
  pickup_date: string  // YYYY-MM-DD
  // Customer info
  customer: {
    name: string
    email: string
    phone: string
  }
  // Optional
  notes?: string
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getAdminUser()

    if (!adminUser) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateBookingRequest = await request.json()
    const adminClient = createAdminClient()

    // 1. Validate required fields
    if (!body.address?.full_address || !body.customer?.email) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 2. Check serviceability
    const { data: serviceAreas } = await adminClient
      .from('service_areas')
      .select('polygon')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('active', true)

    const polygons = (serviceAreas || []).map((sa: { polygon: unknown }) => sa.polygon)
    const point = { lat: body.address.lat, lng: body.address.lng }

    if (!isInServiceArea(point, polygons)) {
      return NextResponse.json(
        { ok: false, error: 'Address is outside service area' },
        { status: 400 }
      )
    }

    // 3. Get pricing rule
    const { data: pricingRule, error: pricingError } = await adminClient
      .from('pricing_rules')
      .select('*')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('dumpster_size', body.dumpster_size)
      .eq('waste_type', body.waste_type)
      .eq('active', true)
      .single()

    if (pricingError || !pricingRule) {
      return NextResponse.json(
        { ok: false, error: 'Pricing rule not found for selected size/waste type' },
        { status: 400 }
      )
    }

    // 4. Calculate pricing
    const dropoffDate = parseDate(body.dropoff_date)
    const pickupDate = parseDate(body.pickup_date)
    const { snapshot, lineItems } = calculatePricing(
      pricingRule as PricingRule,
      dropoffDate,
      pickupDate
    )

    // 5. Find or create customer
    let customerId: string
    let customerHasAccount = false
    let inviteToken: string | null = null

    const { data: existingCustomer } = await adminClient
      .from('customers')
      .select('id, user_id, name, phone')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .eq('email', body.customer.email.toLowerCase())
      .single()

    if (existingCustomer) {
      customerId = (existingCustomer as { id: string; user_id: string | null }).id
      customerHasAccount = !!(existingCustomer as { user_id: string | null }).user_id

      // Update name/phone if provided
      if (body.customer.name || body.customer.phone) {
        await adminClient
          .from('customers')
          .update({
            name: body.customer.name || (existingCustomer as { name: string }).name,
            phone: body.customer.phone || (existingCustomer as { phone: string }).phone,
          } as never)
          .eq('id', customerId)
      }

      // Generate invite token if customer doesn't have account
      if (!customerHasAccount) {
        inviteToken = randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

        await adminClient
          .from('customers')
          .update({
            invite_token: inviteToken,
            invite_token_expires_at: expiresAt.toISOString(),
          } as never)
          .eq('id', customerId)
      }
    } else {
      // Create new customer with invite token
      inviteToken = randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      const { data: newCustomer, error: customerError } = await adminClient
        .from('customers')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          email: body.customer.email.toLowerCase(),
          name: body.customer.name,
          phone: body.customer.phone,
          invite_token: inviteToken,
          invite_token_expires_at: expiresAt.toISOString(),
        } as never)
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Error creating customer:', customerError)
        return NextResponse.json(
          { ok: false, error: 'Failed to create customer' },
          { status: 500 }
        )
      }

      customerId = (newCustomer as { id: string }).id
    }

    // 6. Create address
    const { data: address, error: addressError } = await adminClient
      .from('addresses')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customerId,
        full_address: body.address.full_address,
        street: body.address.street,
        city: body.address.city,
        state: body.address.state,
        zip: body.address.zip,
        lat: body.address.lat,
        lng: body.address.lng,
        place_id: body.address.place_id || null,
      } as never)
      .select('id')
      .single()

    if (addressError || !address) {
      console.error('Error creating address:', addressError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create address' },
        { status: 500 }
      )
    }

    const addressId = (address as { id: string }).id

    // 7. Create quote
    const { data: quote, error: quoteError } = await adminClient
      .from('quotes')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        address_id: addressId,
        waste_type: body.waste_type,
        dumpster_size: body.dumpster_size,
        dropoff_date: body.dropoff_date,
        pickup_date: body.pickup_date,
        status: 'converted',
        pricing_snapshot: snapshot,
      } as never)
      .select('id')
      .single()

    if (quoteError || !quote) {
      console.error('Error creating quote:', quoteError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create quote' },
        { status: 500 }
      )
    }

    const quoteId = (quote as { id: string }).id

    // 8. Create quote line items
    for (const item of lineItems) {
      await adminClient
        .from('quote_line_items')
        .insert({
          quote_id: quoteId,
          label: item.label,
          amount: item.amount,
          line_type: item.type,
          sort_order: item.sort_order,
        } as never)
    }

    // 9. Create booking request (auto-approved)
    const { data: bookingRequest, error: requestError } = await adminClient
      .from('booking_requests')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customerId,
        quote_id: quoteId,
        status: 'approved',
        customer_inputs: { notes: body.notes || null, created_by_admin: true },
      } as never)
      .select('id')
      .single()

    if (requestError || !bookingRequest) {
      console.error('Error creating booking request:', requestError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create booking request' },
        { status: 500 }
      )
    }

    const bookingRequestId = (bookingRequest as { id: string }).id

    // 10. Generate invoice number
    const { data: lastInvoice } = await adminClient
      .from('invoices')
      .select('invoice_number')
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextInvoiceNumber = 1001
    if (lastInvoice) {
      const lastNumber = parseInt((lastInvoice as { invoice_number: string }).invoice_number, 10)
      if (!isNaN(lastNumber)) {
        nextInvoiceNumber = lastNumber + 1
      }
    }

    // 11. Create invoice
    const { data: invoice, error: invoiceError } = await adminClient
      .from('invoices')
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: customerId,
        booking_request_id: bookingRequestId,
        invoice_number: nextInvoiceNumber.toString(),
        status: 'unpaid',
        issued_at: new Date().toISOString(),
        subtotal: snapshot.total,
        total: snapshot.total,
      } as never)
      .select('id, invoice_number')
      .single()

    if (invoiceError || !invoice) {
      console.error('Error creating invoice:', invoiceError)
      return NextResponse.json(
        { ok: false, error: 'Failed to create invoice' },
        { status: 500 }
      )
    }

    const invoiceRecord = invoice as { id: string; invoice_number: string }

    // 12. Create invoice line items
    for (const item of lineItems) {
      await adminClient
        .from('invoice_line_items')
        .insert({
          invoice_id: invoiceRecord.id,
          label: item.label,
          quantity: 1,
          unit_price: item.amount,
          amount: item.amount,
          line_type: item.type,
        } as never)
    }

    // 13. Send email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (customerHasAccount) {
      // Customer has account - send payment link directly
      const paymentUrl = `${siteUrl}/pay?invoice=${invoiceRecord.id}`

      try {
        await sendEmail({
          to: body.customer.email,
          subject: `Your Dumpster Rental is Ready - Invoice #${invoiceRecord.invoice_number}`,
          html: getBookingApprovedHtml({
            customerName: body.customer.name,
            invoiceNumber: invoiceRecord.invoice_number,
            dumpsterSize: body.dumpster_size,
            dropoffDate: body.dropoff_date,
            pickupDate: body.pickup_date,
            address: body.address.full_address,
            total: snapshot.total,
            paymentUrl,
          }),
        })
      } catch (emailError) {
        console.error('Error sending payment email:', emailError)
      }
    } else {
      // Customer needs to register - send invite email
      const signupUrl = `${siteUrl}/signup/complete?token=${inviteToken}`

      try {
        await sendEmail({
          to: body.customer.email,
          subject: `Complete Your Registration - Dumpster Rental Invoice #${invoiceRecord.invoice_number}`,
          html: getInviteSignupHtml({
            customerName: body.customer.name,
            invoiceNumber: invoiceRecord.invoice_number,
            dumpsterSize: body.dumpster_size,
            dropoffDate: body.dropoff_date,
            pickupDate: body.pickup_date,
            address: body.address.full_address,
            total: snapshot.total,
            signupUrl,
          }),
        })
      } catch (emailError) {
        console.error('Error sending invite email:', emailError)
      }
    }

    return NextResponse.json({
      ok: true,
      bookingRequestId,
      invoiceId: invoiceRecord.id,
      invoiceNumber: invoiceRecord.invoice_number,
      customerHasAccount,
    })

  } catch (error) {
    console.error('Admin create booking error:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Email template for invite signup
function getInviteSignupHtml(params: {
  customerName: string
  invoiceNumber: string
  dumpsterSize: number
  dropoffDate: string
  pickupDate: string
  address: string
  total: number
  signupUrl: string
}): string {
  const {
    customerName,
    invoiceNumber,
    dumpsterSize,
    dropoffDate,
    pickupDate,
    address,
    total,
    signupUrl,
  } = params

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0A291A; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .total { font-size: 24px; color: #E65100; font-weight: bold; }
        .cta-button { display: inline-block; background: #E65100; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; }
        .note { background: #E3F2FD; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .steps { background: #FFF3E0; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>McCrackan Roll-Off Service</h1>
        </div>
        <div class="content">
          <h2>Your Dumpster Rental Quote</h2>
          <p>Hi ${customerName},</p>
          <p>We've prepared a dumpster rental for you. To complete your booking and make payment, please create an account.</p>

          <h3>Invoice #${invoiceNumber}</h3>
          <div class="detail-row">
            <span class="label">Dumpster Size:</span>
            <span class="value">${dumpsterSize} Yard</span>
          </div>
          <div class="detail-row">
            <span class="label">Delivery Address:</span>
            <span class="value">${address}</span>
          </div>
          <div class="detail-row">
            <span class="label">Drop-off Date:</span>
            <span class="value">${dropoffDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Pick-up Date:</span>
            <span class="value">${pickupDate}</span>
          </div>
          <div class="detail-row">
            <span class="label">Total Amount:</span>
            <span class="value total">$${(total / 100).toFixed(2)}</span>
          </div>

          <center>
            <a href="${signupUrl}" class="cta-button">Create Account & Pay</a>
          </center>

          <div class="steps">
            <h4>Next Steps:</h4>
            <ol>
              <li>Click the button above to create your account</li>
              <li>Complete payment to confirm your booking</li>
              <li>Your dumpster will be delivered on the scheduled date</li>
            </ol>
          </div>

          <div class="note">
            <strong>This link expires in 7 days.</strong> If you have any questions, please call us at <strong>412-965-2791</strong>.
          </div>

          <p>Thank you for choosing McCrackan Roll-Off Service!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

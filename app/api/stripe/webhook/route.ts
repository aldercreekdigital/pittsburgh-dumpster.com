import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { sendEmail, getPaymentConfirmationHtml } from '@/lib/email/send'
import Stripe from 'stripe'

interface InvoiceData {
  id: string
  invoice_number: string
  total: number
  customer_id: string
  booking_request_id: string
  booking_request: {
    id: string
    customer_id: string
    quote: {
      id: string
      address_id: string
      dumpster_size: number
      dropoff_date: string
      pickup_date: string
      pricing_snapshot: unknown
      address: { full_address: string } | null
    } | null
    customer: { id: string; name: string; email: string } | null
  } | null
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoice_id

  if (!invoiceId) {
    console.error('No invoice_id in session metadata')
    return
  }

  const adminClient = createAdminClient()

  // 1. Load the invoice with related data
  const { data: invoice, error: invoiceError } = await adminClient
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total,
      customer_id,
      booking_request_id,
      booking_request:booking_requests(
        id,
        customer_id,
        quote:quotes(
          id,
          address_id,
          dumpster_size,
          dropoff_date,
          pickup_date,
          pricing_snapshot,
          address:addresses(full_address)
        ),
        customer:customers(id, name, email)
      )
    `)
    .eq('id', invoiceId)
    .single()

  if (invoiceError || !invoice) {
    console.error('Invoice not found:', invoiceId)
    return
  }

  const typedInvoice = invoice as InvoiceData
  const bookingRequest = typedInvoice.booking_request
  const quote = bookingRequest?.quote
  const customer = bookingRequest?.customer

  if (!quote || !customer || !bookingRequest) {
    console.error('Missing booking request, quote, or customer for invoice:', invoiceId)
    return
  }

  // 2. Mark invoice as paid
  await adminClient
    .from('invoices')
    .update({
      status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
    } as never)
    .eq('id', invoiceId)

  // 3. Create payment record
  await adminClient
    .from('payments')
    .insert({
      invoice_id: invoiceId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount: session.amount_total || typedInvoice.total,
      status: 'succeeded',
    } as never)

  // 4. Create the booking
  const { data: booking, error: bookingError } = await adminClient
    .from('bookings')
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      booking_request_id: bookingRequest.id,
      customer_id: customer.id,
      address_id: quote.address_id,
      status: 'confirmed',
      dropoff_scheduled_at: quote.dropoff_date,
      pickup_due_at: quote.pickup_date,
      pricing_snapshot: quote.pricing_snapshot,
    } as never)
    .select('id')
    .single()

  if (bookingError) {
    console.error('Error creating booking:', bookingError)
  }

  // 5. Link booking to invoice
  const bookingRecord = booking as { id: string } | null
  if (bookingRecord) {
    await adminClient
      .from('invoices')
      .update({ booking_id: bookingRecord.id } as never)
      .eq('id', invoiceId)
  }

  // 6. Save customer's payment method for future charges
  if (session.customer && session.payment_intent) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
      if (paymentIntent.payment_method) {
        await adminClient
          .from('stripe_customers')
          .update({ default_payment_method_id: paymentIntent.payment_method as string } as never)
          .eq('stripe_customer_id', session.customer as string)
      }
    } catch (err) {
      console.error('Error saving payment method:', err)
    }
  }

  // 7. Send confirmation email
  try {
    await sendEmail({
      to: customer.email,
      subject: `Payment Confirmed - Invoice #${typedInvoice.invoice_number}`,
      html: getPaymentConfirmationHtml({
        customerName: customer.name,
        invoiceNumber: typedInvoice.invoice_number,
        total: typedInvoice.total,
        dumpsterSize: quote.dumpster_size,
        address: quote.address?.full_address || '',
        dropoffDate: quote.dropoff_date,
        pickupDate: quote.pickup_date,
      }),
    })
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError)
  }

  console.log(`Payment completed for invoice ${invoiceId}, booking created: ${bookingRecord?.id}`)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        // This is handled by checkout.session.completed for initial payments
        // Could be used for off-session overage charges later
        console.log('Payment intent succeeded:', event.data.object.id)
        break

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id)
        // Could send failure notification here
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

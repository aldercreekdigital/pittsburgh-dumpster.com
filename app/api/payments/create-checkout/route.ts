import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

interface CreateCheckoutBody {
  invoiceId: string
}

interface InvoiceData {
  id: string
  invoice_number: string
  status: string
  total: number
  customer_id: string
  customer: {
    id: string
    name: string
    email: string
  } | null
  line_items: {
    id: string
    label: string
    amount: number
  }[]
}

/**
 * Create a Stripe Checkout session for an invoice.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutBody = await request.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // 1. Load the invoice
    const { data: invoice, error: invoiceError } = await adminClient
      .from('invoices')
      .select(`
        id,
        invoice_number,
        status,
        total,
        customer_id,
        customer:customers(id, name, email),
        line_items:invoice_line_items(id, label, amount)
      `)
      .eq('id', invoiceId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const typedInvoice = invoice as InvoiceData

    if (typedInvoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice already paid' },
        { status: 400 }
      )
    }

    if (!typedInvoice.customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 400 }
      )
    }

    // 2. Get or create Stripe customer
    let stripeCustomerId: string

    const { data: existingStripeCustomer } = await adminClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('customer_id', typedInvoice.customer_id)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (existingStripeCustomer) {
      stripeCustomerId = (existingStripeCustomer as { stripe_customer_id: string }).stripe_customer_id
    } else {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: typedInvoice.customer.email,
        name: typedInvoice.customer.name,
        metadata: {
          business_id: DEFAULT_BUSINESS_ID,
          customer_id: typedInvoice.customer_id,
        },
      })

      stripeCustomerId = stripeCustomer.id

      // Save to database
      await adminClient
        .from('stripe_customers')
        .insert({
          business_id: DEFAULT_BUSINESS_ID,
          customer_id: typedInvoice.customer_id,
          stripe_customer_id: stripeCustomerId,
        } as never)
    }

    // 3. Create Checkout session
    const lineItems = typedInvoice.line_items?.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.label,
        },
        unit_amount: item.amount,
      },
      quantity: 1,
    })) || [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Invoice #${typedInvoice.invoice_number}`,
        },
        unit_amount: typedInvoice.total,
      },
      quantity: 1,
    }]

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseUrl}/pay/success?invoice=${invoiceId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay?invoice=${invoiceId}&canceled=true`,
      metadata: {
        invoice_id: invoiceId,
        business_id: DEFAULT_BUSINESS_ID,
        customer_id: typedInvoice.customer_id,
      },
      payment_intent_data: {
        setup_future_usage: 'off_session', // Save card for future overage charges
        metadata: {
          invoice_id: invoiceId,
          business_id: DEFAULT_BUSINESS_ID,
        },
      },
    })

    // 4. Save checkout session ID to invoice
    await adminClient
      .from('invoices')
      .update({ stripe_checkout_session_id: session.id } as never)
      .eq('id', invoiceId)

    return NextResponse.json({
      ok: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Create checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

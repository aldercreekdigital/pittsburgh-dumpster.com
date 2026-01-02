import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, DEFAULT_BUSINESS_ID } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { sendEmail } from '@/lib/email/send'

interface RouteContext {
  params: Promise<{ id: string }>
}

interface AdjustmentData {
  id: string
  booking_id: string
  customer_id: string
  kind: string
  amount: number
  status: string
  notes: string | null
}

interface StripeCustomerData {
  stripe_customer_id: string
  default_payment_method_id: string | null
}

interface CustomerData {
  name: string
  email: string
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: adjustmentId } = await context.params
    const adminClient = createAdminClient()

    // Load adjustment
    const { data: adjustmentData, error: adjustmentError } = await adminClient
      .from('adjustments')
      .select('id, booking_id, customer_id, kind, amount, status, notes')
      .eq('id', adjustmentId)
      .eq('business_id', DEFAULT_BUSINESS_ID)
      .single()

    if (adjustmentError || !adjustmentData) {
      return NextResponse.json(
        { error: 'Adjustment not found' },
        { status: 404 }
      )
    }

    const adjustment = adjustmentData as AdjustmentData

    if (adjustment.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot charge adjustment with status: ${adjustment.status}` },
        { status: 400 }
      )
    }

    // Get Stripe customer info
    const { data: stripeCustomerData, error: stripeError } = await adminClient
      .from('stripe_customers')
      .select('stripe_customer_id, default_payment_method_id')
      .eq('customer_id', adjustment.customer_id)
      .single()

    if (stripeError || !stripeCustomerData) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this customer' },
        { status: 400 }
      )
    }

    const stripeCustomer = stripeCustomerData as StripeCustomerData

    if (!stripeCustomer.default_payment_method_id) {
      return NextResponse.json(
        { error: 'No payment method on file for this customer' },
        { status: 400 }
      )
    }

    // Get customer info for receipt
    const { data: customerData } = await adminClient
      .from('customers')
      .select('name, email')
      .eq('id', adjustment.customer_id)
      .single()

    const customer = customerData as CustomerData | null

    try {
      // Create and confirm payment intent off-session
      const paymentIntent = await stripe.paymentIntents.create({
        amount: adjustment.amount,
        currency: 'usd',
        customer: stripeCustomer.stripe_customer_id,
        payment_method: stripeCustomer.default_payment_method_id,
        off_session: true,
        confirm: true,
        metadata: {
          adjustment_id: adjustment.id,
          booking_id: adjustment.booking_id,
          customer_id: adjustment.customer_id,
          kind: adjustment.kind,
        },
        description: `${adjustment.kind.replace(/_/g, ' ')} charge${adjustment.notes ? ': ' + adjustment.notes : ''}`,
      })

      if (paymentIntent.status === 'succeeded') {
        // Update adjustment to charged
        await adminClient
          .from('adjustments')
          .update({
            status: 'charged',
            stripe_payment_intent_id: paymentIntent.id,
          } as never)
          .eq('id', adjustmentId)

        // Send receipt email to customer
        if (customer?.email) {
          try {
            await sendEmail({
              to: customer.email,
              subject: `Payment Receipt - ${adjustment.kind.replace(/_/g, ' ')} Charge`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2>Payment Receipt</h2>
                  <p>Hi ${customer.name},</p>
                  <p>A charge of <strong>$${(adjustment.amount / 100).toFixed(2)}</strong> has been processed to your card on file.</p>
                  <p><strong>Charge Type:</strong> ${adjustment.kind.replace(/_/g, ' ')}</p>
                  ${adjustment.notes ? `<p><strong>Details:</strong> ${adjustment.notes}</p>` : ''}
                  <p>If you have any questions, please contact us.</p>
                  <p>Thank you,<br>Pittsburgh Dumpster</p>
                </div>
              `,
            })
          } catch (emailError) {
            console.error('Error sending receipt email:', emailError)
          }
        }

        return NextResponse.json({
          success: true,
          paymentIntentId: paymentIntent.id,
        })
      } else {
        // Payment requires additional action
        await adminClient
          .from('adjustments')
          .update({
            status: 'failed',
            notes: adjustment.notes
              ? `${adjustment.notes}\n\nPayment requires additional action: ${paymentIntent.status}`
              : `Payment requires additional action: ${paymentIntent.status}`,
          } as never)
          .eq('id', adjustmentId)

        return NextResponse.json(
          { error: `Payment requires additional action: ${paymentIntent.status}` },
          { status: 400 }
        )
      }
    } catch (stripeError) {
      console.error('Stripe payment error:', stripeError)

      // Update adjustment to failed
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Unknown error'
      await adminClient
        .from('adjustments')
        .update({
          status: 'failed',
          notes: adjustment.notes
            ? `${adjustment.notes}\n\nPayment failed: ${errorMessage}`
            : `Payment failed: ${errorMessage}`,
        } as never)
        .eq('id', adjustmentId)

      // Send failure notification to customer
      if (customer?.email) {
        try {
          await sendEmail({
            to: customer.email,
            subject: 'Payment Failed - Action Required',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Payment Failed</h2>
                <p>Hi ${customer.name},</p>
                <p>We attempted to charge <strong>$${(adjustment.amount / 100).toFixed(2)}</strong> to your card on file, but the payment failed.</p>
                <p><strong>Charge Type:</strong> ${adjustment.kind.replace(/_/g, ' ')}</p>
                <p>Please contact us to update your payment information or resolve this charge.</p>
                <p>Thank you,<br>Pittsburgh Dumpster</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error('Error sending failure email:', emailError)
        }
      }

      return NextResponse.json(
        { error: `Payment failed: ${errorMessage}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in charge adjustment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

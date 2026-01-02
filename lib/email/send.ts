// Email sending abstraction
// Uses the Alder Creek Digital Mailer Service

const MAILER_URL = 'https://notifications-aldercreekdigital-com.vercel.app/api/send-report'

interface EmailAttachment {
  filename: string
  contentType: string
  content: string // Base64 encoded
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

interface SendEmailResult {
  success: boolean
  error?: string
}

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, attachments } = params

  try {
    const response = await fetch(MAILER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secretKey: process.env.MAILER_SECRET,
        recipientEmail: to,
        subject,
        htmlBody: html,
        attachments: attachments || [],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Email send failed:', errorText)
      return { success: false, error: errorText }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Email templates
export function getBookingRequestNotificationHtml(params: {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  dumpsterSize: number
  wasteType: string
  dropoffDate: string
  pickupDate: string
  total: number
  adminUrl: string
}): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    address,
    dumpsterSize,
    wasteType,
    dropoffDate,
    pickupDate,
    total,
    adminUrl,
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
        .cta-button { display: inline-block; background: #E65100; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Booking Request</h1>
        </div>
        <div class="content">
          <h2>Customer Information</h2>
          <div class="detail-row">
            <span class="label">Name:</span>
            <span class="value">${customerName}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">${customerEmail}</span>
          </div>
          <div class="detail-row">
            <span class="label">Phone:</span>
            <span class="value">${customerPhone}</span>
          </div>

          <h2>Rental Details</h2>
          <div class="detail-row">
            <span class="label">Address:</span>
            <span class="value">${address}</span>
          </div>
          <div class="detail-row">
            <span class="label">Dumpster Size:</span>
            <span class="value">${dumpsterSize} Yard</span>
          </div>
          <div class="detail-row">
            <span class="label">Waste Type:</span>
            <span class="value">${wasteType.replace('_', ' ')}</span>
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
            <span class="label">Total:</span>
            <span class="value total">$${(total / 100).toFixed(2)}</span>
          </div>

          <center>
            <a href="${adminUrl}" class="cta-button">View Request in Admin</a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getBookingRequestConfirmationHtml(params: {
  customerName: string
  address: string
  dumpsterSize: number
  wasteType: string
  dropoffDate: string
  pickupDate: string
  total: number
}): string {
  const {
    customerName,
    address,
    dumpsterSize,
    wasteType,
    dropoffDate,
    pickupDate,
    total,
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
        .next-steps { background: #E3F2FD; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>McCrackan Roll-Off Service</h1>
        </div>
        <div class="content">
          <h2>Booking Request Received!</h2>
          <p>Hi ${customerName},</p>
          <p>Thank you for your dumpster rental request. We've received your booking and will review it shortly.</p>

          <h3>Rental Details</h3>
          <div class="detail-row">
            <span class="label">Address:</span>
            <span class="value">${address}</span>
          </div>
          <div class="detail-row">
            <span class="label">Dumpster Size:</span>
            <span class="value">${dumpsterSize} Yard</span>
          </div>
          <div class="detail-row">
            <span class="label">Waste Type:</span>
            <span class="value">${wasteType}</span>
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
            <span class="label">Estimated Total:</span>
            <span class="value total">$${(total / 100).toFixed(2)}</span>
          </div>

          <div class="next-steps">
            <h3>What happens next?</h3>
            <ol>
              <li>We'll review your request within 1-2 business hours</li>
              <li>You'll receive an email with a secure payment link</li>
              <li>Complete payment to confirm your booking</li>
              <li>Your dumpster will be delivered on the scheduled date</li>
            </ol>
          </div>

          <p>Questions? Call us at <strong>412-965-2791</strong></p>

          <p>Thank you for choosing McCrackan Roll-Off Service!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getBookingApprovedHtml(params: {
  customerName: string
  invoiceNumber: string
  dumpsterSize: number
  dropoffDate: string
  pickupDate: string
  address: string
  total: number
  paymentUrl: string
}): string {
  const {
    customerName,
    invoiceNumber,
    dumpsterSize,
    dropoffDate,
    pickupDate,
    address,
    total,
    paymentUrl,
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
        .approved { color: #2E7D32; font-size: 24px; font-weight: bold; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .total { font-size: 24px; color: #E65100; font-weight: bold; }
        .cta-button { display: inline-block; background: #E65100; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; }
        .note { background: #FFF3E0; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>McCrackan Roll-Off Service</h1>
        </div>
        <div class="content">
          <p class="approved">Your Booking is Approved!</p>
          <p>Hi ${customerName},</p>
          <p>Great news! Your dumpster rental request has been approved. Please complete payment to confirm your booking.</p>

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
            <a href="${paymentUrl}" class="cta-button">Complete Payment</a>
          </center>

          <div class="note">
            <strong>Important:</strong> Your booking will be confirmed once payment is received.
            If you have any questions, please call us at 412-965-2791.
          </div>

          <p>Thank you for choosing McCrackan Roll-Off Service!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getBookingDeclinedHtml(params: {
  customerName: string
  reason?: string
  dumpsterSize: number
  dropoffDate: string
  address: string
}): string {
  const {
    customerName,
    reason,
    dumpsterSize,
    dropoffDate,
    address,
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
        .reason { background: #FFEBEE; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #C62828; }
        .contact { background: #E3F2FD; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>McCrackan Roll-Off Service</h1>
        </div>
        <div class="content">
          <p>Hi ${customerName},</p>
          <p>Unfortunately, we are unable to fulfill your dumpster rental request at this time.</p>

          <h3>Request Details</h3>
          <div class="detail-row">
            <span class="label">Dumpster Size:</span>
            <span class="value">${dumpsterSize} Yard</span>
          </div>
          <div class="detail-row">
            <span class="label">Delivery Address:</span>
            <span class="value">${address}</span>
          </div>
          <div class="detail-row">
            <span class="label">Requested Drop-off:</span>
            <span class="value">${dropoffDate}</span>
          </div>

          ${reason ? `
          <div class="reason">
            <strong>Reason:</strong>
            <p>${reason}</p>
          </div>
          ` : ''}

          <div class="contact">
            <h4>Need to discuss alternatives?</h4>
            <p>Please give us a call at <strong>412-965-2791</strong> and we'll be happy to help find a solution that works for you.</p>
          </div>

          <p>We apologize for any inconvenience and hope to serve you in the future.</p>
          <p>Thank you,<br>McCrackan Roll-Off Service</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function getPaymentConfirmationHtml(params: {
  customerName: string
  invoiceNumber: string
  total: number
  dumpsterSize: number
  address: string
  dropoffDate: string
  pickupDate: string
}): string {
  const {
    customerName,
    invoiceNumber,
    total,
    dumpsterSize,
    address,
    dropoffDate,
    pickupDate,
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
        .success { color: #2E7D32; font-size: 24px; font-weight: bold; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>McCrackan Roll-Off Service</h1>
        </div>
        <div class="content">
          <p class="success">Payment Confirmed!</p>
          <p>Hi ${customerName},</p>
          <p>Thank you for your payment. Your dumpster rental has been confirmed.</p>

          <h2>Booking Details</h2>
          <div class="detail-row">
            <span class="label">Invoice:</span>
            <span class="value">#${invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="label">Amount Paid:</span>
            <span class="value">$${(total / 100).toFixed(2)}</span>
          </div>
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

          <p>We will contact you to confirm delivery details. If you have any questions, please call us at 412-965-2791.</p>

          <p>Thank you for choosing McCrackan Roll-Off Service!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

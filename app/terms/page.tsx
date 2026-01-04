import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | McCrackan Roll-Off Services',
  description: 'Terms of Service for McCrackan Roll-Off Services dumpster rental services.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-narrow">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-primary-dark-green mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 4, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing our website and using the dumpster rental services provided by McCrackan Roll-Off Services, LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our services.
              </p>
              <p className="text-gray-700">
                <strong>Contact Information:</strong><br />
                McCrackan Roll-Off Services, LLC<br />
                1555 Oakdale Road<br />
                Oakdale, PA 15071<br />
                Phone: (412) 965-2791
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Services</h2>
              <p className="text-gray-700 mb-4">
                McCrackan Roll-Off Services provides roll-off dumpster rental services for residential and commercial customers in the Pittsburgh metropolitan area. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Delivery of roll-off dumpsters (various sizes available)</li>
                <li>Pickup and disposal of waste materials</li>
                <li>Rental periods as specified at the time of booking</li>
              </ul>
              <p className="text-gray-700">
                Service availability is limited to our designated service area. Address verification is required before booking confirmation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Booking and Payment</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.1 Booking Process</h3>
              <p className="text-gray-700 mb-4">
                All bookings must be made through our website or by contacting us directly. A booking is not confirmed until payment has been received and you have received a confirmation email.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.2 Pricing</h3>
              <p className="text-gray-700 mb-4">
                Prices are quoted at the time of booking and include the base rental fee, delivery, and disposal within the included tonnage allowance. Additional charges may apply for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Extended service days beyond the included rental period</li>
                <li>Weight overages exceeding the included tonnage</li>
                <li>Prohibited items requiring special disposal</li>
                <li>Additional trips due to blocked access or other issues</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.3 Payment Terms</h3>
              <p className="text-gray-700 mb-4">
                Full payment is required at the time of booking. We accept major credit cards through our secure payment processor (Stripe). By providing payment information, you authorize us to charge the total amount due.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">3.4 Taxes and Fees</h3>
              <p className="text-gray-700 mb-4">
                All prices include applicable Pennsylvania sales tax on taxable items (container rental). A card processing fee is added to cover payment processing costs. The complete breakdown is shown before you complete your booking.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Cancellation and Refund Policy</h2>
              <p className="text-gray-700 mb-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <strong>All sales are final.</strong> Once a booking is confirmed and payment is processed, no refunds will be issued. Please ensure all details are correct before completing your booking.
              </p>
              <p className="text-gray-700">
                If you need to reschedule your delivery date, please contact us at (412) 965-2791 as soon as possible. Rescheduling is subject to availability and must be requested at least 24 hours before the scheduled delivery.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Customer Responsibilities</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Site Access</h3>
              <p className="text-gray-700 mb-4">
                You are responsible for ensuring that the delivery location is accessible for our trucks and equipment. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Providing accurate delivery address and placement instructions</li>
                <li>Ensuring adequate clearance for truck access (minimum 12 feet wide, 14 feet high)</li>
                <li>Clearing the placement area of obstacles</li>
                <li>Notifying us of any gate codes, access restrictions, or special instructions</li>
                <li>Obtaining any necessary permits from local authorities</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Proper Use</h3>
              <p className="text-gray-700 mb-4">
                You agree to use the dumpster only for its intended purpose and in accordance with these Terms. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Not exceeding the fill line marked on the dumpster</li>
                <li>Not placing prohibited items in the dumpster</li>
                <li>Keeping the area around the dumpster clear</li>
                <li>Preventing unauthorized use of the dumpster</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Prohibited Items</h2>
              <p className="text-gray-700 mb-4">
                The following items are strictly prohibited and may NOT be placed in our dumpsters:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Hazardous materials:</strong> chemicals, paint, solvents, oil, gasoline, pesticides, asbestos</li>
                <li><strong>Electronics:</strong> TVs, computers, monitors (e-waste)</li>
                <li><strong>Appliances with freon:</strong> refrigerators, freezers, air conditioners</li>
                <li><strong>Tires</strong> (unless specifically arranged)</li>
                <li><strong>Batteries</strong> of any kind</li>
                <li><strong>Medical waste</strong></li>
                <li><strong>Food waste</strong> and organic materials in large quantities</li>
                <li><strong>Liquids</strong> and wet waste</li>
                <li><strong>Propane tanks</strong> and compressed gas cylinders</li>
              </ul>
              <p className="text-gray-700 mb-4 bg-red-50 border border-red-200 p-4 rounded-lg">
                <strong>Violation Penalty:</strong> If prohibited items are found in the dumpster, you will be charged additional fees for proper disposal, and you assume all liability for any fines or penalties imposed by disposal facilities or regulatory authorities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Weight Overages</h2>
              <p className="text-gray-700 mb-4">
                Each dumpster rental includes a specified tonnage allowance. If the actual weight of your load exceeds this allowance, you will be charged an overage fee per ton as specified in your booking confirmation.
              </p>
              <p className="text-gray-700">
                Overages are determined by certified scale tickets at the disposal facility. Additional overage charges will be billed to the payment method on file and are due upon receipt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Delivery and Pickup</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-2">8.1 Delivery</h3>
              <p className="text-gray-700 mb-4">
                We will deliver the dumpster on the scheduled delivery date. Delivery times are estimates and may vary due to weather, traffic, or operational factors. We do not guarantee specific delivery times unless expressly agreed upon.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">8.2 Pickup</h3>
              <p className="text-gray-700 mb-4">
                Pickup will occur on or after the scheduled pickup date. Please ensure the dumpster is accessible and not overfilled. If we cannot complete pickup due to blocked access, overfilling, or prohibited items, additional fees may apply.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">8.3 Extended Rental</h3>
              <p className="text-gray-700">
                If you need to keep the dumpster beyond the scheduled pickup date, you will be charged an extended service day fee for each additional day. Contact us to arrange an extension.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Liability and Indemnification</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-2">9.1 Property Damage</h3>
              <p className="text-gray-700 mb-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <strong>Customer assumes all risk</strong> for damage to driveways, lawns, landscaping, or other surfaces caused by the weight of the dumpster or delivery/pickup operations. Dumpsters are heavy equipment that may cause cracking, rutting, or other surface damage. It is your responsibility to assess whether your property can support the weight of a loaded dumpster.
              </p>
              <p className="text-gray-700 mb-4">
                We recommend placing plywood or other protective materials under the dumpster if you have concerns about surface damage.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">9.2 Limitation of Liability</h3>
              <p className="text-gray-700 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MCCRACKAN ROLL-OFF SERVICES, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR OTHER INTANGIBLE LOSSES.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">9.3 Indemnification</h3>
              <p className="text-gray-700">
                You agree to indemnify, defend, and hold harmless McCrackan Roll-Off Services, LLC, its officers, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services, violation of these Terms, or violation of any law or rights of a third party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Account Terms</h2>
              <p className="text-gray-700 mb-4">
                If you create an account on our website:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must provide accurate and complete information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Allegheny County, Pennsylvania.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Modifications to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>McCrackan Roll-Off Services, LLC</strong><br />
                1555 Oakdale Road<br />
                Oakdale, PA 15071<br />
                Phone: (412) 965-2791
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

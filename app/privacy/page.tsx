import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | McCrackan Roll-Off Services',
  description: 'Privacy Policy for McCrackan Roll-Off Services dumpster rental services.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-narrow">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-bold text-primary-dark-green mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 4, 2025</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                McCrackan Roll-Off Services, LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our dumpster rental services.
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you use our services, we may collect the following personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Service address (delivery location)</li>
                <li>Billing address</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Account credentials (if you create an account)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Automatically Collected Information</h3>
              <p className="text-gray-700 mb-4">
                When you visit our website, we may automatically collect:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent</li>
                <li>Referring website</li>
                <li>Location data (for service area verification)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Process and fulfill your dumpster rental orders</li>
                <li>Schedule deliveries and pickups</li>
                <li>Process payments and send invoices</li>
                <li>Communicate with you about your orders and services</li>
                <li>Verify your address is within our service area</li>
                <li>Send service-related notifications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We use the following third-party services to operate our business:
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Stripe (Payment Processing)</h3>
              <p className="text-gray-700 mb-4">
                We use Stripe to process payments securely. Your payment information is transmitted directly to Stripe and is not stored on our servers. Stripe&apos;s privacy policy can be found at{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-green hover:underline">
                  stripe.com/privacy
                </a>.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Mapbox (Mapping Services)</h3>
              <p className="text-gray-700 mb-4">
                We use Mapbox to display maps and verify service areas. Mapbox may collect location data when you use our address verification features. Mapbox&apos;s privacy policy can be found at{' '}
                <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-green hover:underline">
                  mapbox.com/legal/privacy
                </a>.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Supabase (Data Storage)</h3>
              <p className="text-gray-700 mb-4">
                We use Supabase to securely store and manage customer data. Supabase&apos;s privacy policy can be found at{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-green hover:underline">
                  supabase.com/privacy
                </a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encryption of data in transit (SSL/TLS)</li>
                <li>Secure payment processing through PCI-compliant services</li>
                <li>Access controls and authentication requirements</li>
                <li>Regular security assessments</li>
              </ul>
              <p className="text-gray-700">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. Transaction records are retained for a minimum of seven (7) years for tax and accounting purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              </ul>
              <p className="text-gray-700">
                To exercise these rights, please contact us at (412) 965-2791.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
              <p className="text-gray-700">
                Our website uses cookies and similar technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors come from. You can control cookies through your browser settings. Disabling cookies may affect the functionality of certain features on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. The updated version will be indicated by the &quot;Last Updated&quot; date at the top of this page. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-[#0F2D1F] rounded flex items-center justify-center text-[#C8960C] font-bold text-xs">G</div>
          <Link href="/" className="font-serif text-lg text-[#0F2D1F] font-bold">Grant OS</Link>
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#0F2D1F] mb-3">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Effective: March 18, 2026 · Grant OS, a product of Huit.AI, LLC</p>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">1. Introduction</h2>
            <p>Grant OS ("we," "our," or "the Platform") is a product of Huit.AI, LLC. This Privacy Policy describes how we collect, use, store, and protect information when you use the Grant OS platform. By using Grant OS, you agree to the practices described in this policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">2. Information we collect</h2>
            <h3 className="font-semibold text-[#0F2D1F] mb-2">2.1 Account and organizational data</h3>
            <p className="mb-3">When you create a Grant OS account, we collect: name and email address, organization name and type, federal identifiers (EIN, UEI), SAM.gov registration status, and city/state.</p>
            <h3 className="font-semibold text-[#0F2D1F] mb-2">2.2 Grant management data</h3>
            <p className="mb-3">We store grant records, deadlines, award information, AI-generated narratives, and compliance monitoring data that you enter or that is generated through your use of the Platform.</p>
            <h3 className="font-semibold text-[#0F2D1F] mb-2">2.3 Attestation records</h3>
            <p className="mb-3">We maintain a permanent, append-only log of all User Attestations completed on the Platform, including timestamp, content type, and a privacy-preserving hash of IP address and user agent. These records cannot be deleted.</p>
            <h3 className="font-semibold text-[#0F2D1F] mb-2">2.4 Payment information</h3>
            <p className="mb-3">Payment processing is handled by Stripe, Inc. We do not store credit card numbers or bank account details. We store your Stripe Customer ID and subscription status.</p>
            <h3 className="font-semibold text-[#0F2D1F] mb-2">2.5 Usage data</h3>
            <p>We collect standard usage analytics including pages visited, features used, and session information. We use Supabase as our database provider, which collects standard server logs.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>To provide, operate, and improve the Grant OS platform</li>
              <li>To process subscription payments through Stripe</li>
              <li>To send transactional emails (account confirmation, subscription receipts, onboarding) via Resend</li>
              <li>To generate AI-assisted grant narratives using the Anthropic Claude API</li>
              <li>To maintain compliance records including attestation logs</li>
              <li>To monitor and alert you to federal compliance obligations</li>
            </ul>
            <p className="mt-3">We do not sell your personal data or organizational data to third parties. We do not use your data for advertising purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">4. Third-party processors</h2>
            <p className="mb-3">We share data with the following third-party service providers solely to operate the Platform:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li><strong>Supabase</strong> (database and authentication) — your account data and grant records are stored in Supabase</li>
              <li><strong>Stripe, Inc.</strong> (payment processing) — your billing information is processed by Stripe under their privacy policy</li>
              <li><strong>Anthropic, PBC</strong> (AI narrative generation) — your prompt inputs are processed by the Anthropic Claude API to generate narratives</li>
              <li><strong>Resend</strong> (transactional email) — your email address is used to deliver platform notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">5. FERPA</h2>
            <p>Grant OS does not collect, store, or process student-level education records as defined by the Family Educational Rights and Privacy Act (FERPA), 20 U.S.C. § 1232g. School district users are responsible for ensuring that no personally identifiable student information is entered into the Platform. Grant OS is not a "school official" under FERPA and does not access student data systems.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">6. Data retention</h2>
            <p>We retain your account and grant data for the duration of your active subscription plus 30 days following cancellation, after which you may request export. Attestation logs are retained permanently as required for legal compliance purposes and cannot be deleted. Payment records are retained as required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">7. Data security</h2>
            <p>We implement industry-standard security measures including encryption at rest and in transit, row-level security on all database tables, and access controls limiting data access to authenticated users. However, no system is completely secure. We encourage users not to include personally identifiable information about program beneficiaries in grant narratives beyond what is required for a grant application.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">8. Your rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:privacy@grantos.ai" className="text-[#3B6E50] underline">privacy@grantos.ai</a>. Note that attestation logs cannot be deleted as they are compliance records. Data export requests will be fulfilled within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">9. Changes to this policy</h2>
            <p>We will notify active subscribers of material changes to this Privacy Policy via email at least 30 days before changes take effect.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">10. Contact</h2>
            <p>Privacy questions: <a href="mailto:privacy@grantos.ai" className="text-[#3B6E50] underline">privacy@grantos.ai</a><br />
            General support: <a href="mailto:support@grantos.ai" className="text-[#3B6E50] underline">support@grantos.ai</a><br />
            Grant OS · A product of Huit.AI, LLC · Anchorage, Alaska</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-sm">
          <Link href="/terms" className="text-[#3B6E50] hover:underline">Terms of Service</Link>
          <Link href="/auth/login" className="text-[#3B6E50] hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

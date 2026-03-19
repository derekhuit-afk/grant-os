import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 bg-[#0F2D1F] rounded flex items-center justify-center text-[#C8960C] font-bold text-xs">G</div>
          <Link href="/" className="font-serif text-lg text-[#0F2D1F] font-bold">Grant OS</Link>
        </div>

        <h1 className="text-3xl font-serif font-bold text-[#0F2D1F] mb-3">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Effective: March 18, 2026 · Grant OS, a product of Huit.AI, LLC</p>

        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-8">
          <p className="text-sm font-semibold text-red-800 mb-1">Important Notice Regarding AI-Generated Content</p>
          <p className="text-sm text-red-700 leading-relaxed">Grant OS uses artificial intelligence to assist in drafting grant narratives. All AI-generated content is advisory only. Users bear sole responsibility for reviewing, verifying, and approving all content before submission. False or exaggerated grant applications submitted to federal agencies may constitute fraud under 18 U.S.C. § 1001 and other applicable law.</p>
        </div>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">1. Acceptance of terms</h2>
            <p>By accessing Grant OS you agree to be bound by these Terms. If you are accessing Grant OS on behalf of an organization, you represent you have authority to bind that entity.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">2. Description of services</h2>
            <p>Grant OS provides AI-assisted grant management including: Grant Discovery, AI Narrative Builder, Pipeline management, Compliance monitoring, FAC/990 data integration, and Organizational profile management. Grant OS does not submit grant applications on behalf of users.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">3. AI-generated content — disclaimer</h2>
            <p className="mb-2">AI-generated content may contain factual errors and may not comply with program-specific requirements. Users must:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verify all statistics and data against organizational records</li>
              <li>Confirm content meets funder-specific requirements</li>
              <li>Complete the mandatory User Attestation before use</li>
            </ul>
            <p className="mt-2">Nothing produced by Grant OS constitutes legal, financial, or compliance advice.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">4. Federal grant compliance</h2>
            <p>Compliance with OMB Uniform Guidance (2 CFR Part 200), GEPA Section 427, Single Audit requirements (31 U.S.C. § 7502), and all other applicable federal regulations remains the sole responsibility of the user organization. Grant OS compliance tools are informational aids only.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">5. Subscription and billing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mb-4">
                <thead>
                  <tr className="bg-[#EAF2EC]">
                    <th className="text-left px-3 py-2 font-semibold">Tier</th>
                    <th className="text-left px-3 py-2 font-semibold">Monthly</th>
                    <th className="text-left px-3 py-2 font-semibold">Annual (15% off)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[['SEED (Nonprofit)', '$299/mo', '$3,052/yr'], ['GROW (Nonprofit)', '$549/mo', '$5,600/yr'], ['SCALE (Nonprofit)', '$799/mo', '$8,150/yr'],
                    ['DISTRICT (Gov)', '$999/mo', '$10,190/yr'], ['CONSORTIUM (Gov)', '$1,750/mo', '$17,850/yr'], ['ENTERPRISE (Gov)', '$2,500/mo', '$25,500/yr']].map(row => (
                    <tr key={row[0]}>
                      <td className="px-3 py-2">{row[0]}</td>
                      <td className="px-3 py-2">{row[1]}</td>
                      <td className="px-3 py-2">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>No free trial. Subscriptions auto-renew. No refunds for partial periods. School districts may request PO billing (Net-30).</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">6. User attestation obligations</h2>
            <p>Prior to using AI-generated content, users must complete the in-platform User Attestation confirming they have reviewed and verified the content. Attestations are timestamped and logged permanently.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">7. Limitation of liability</h2>
            <p className="uppercase text-xs leading-relaxed">To the maximum extent permitted by law, Huit.AI, LLC shall not be liable for any indirect, incidental, or consequential damages, including loss of grant funding, grant rejection, regulatory sanctions, or legal penalties arising from AI-generated content. Aggregate liability shall not exceed subscription fees paid in the preceding three months.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">8. Prohibited uses</h2>
            <p>Users may not use Grant OS to submit knowingly false information to funding agencies, generate applications for organizations they are not authorized to represent, or reverse engineer any portion of the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">9. Governing law</h2>
            <p>These Terms are governed by the laws of the State of Alaska. Disputes shall be resolved by binding arbitration in Anchorage, Alaska under AAA rules. Class action waiver applies.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-3">10. Contact</h2>
            <p><a href="mailto:legal@grantos.ai" className="text-[#3B6E50] underline">legal@grantos.ai</a> · <a href="mailto:support@grantos.ai" className="text-[#3B6E50] underline">support@grantos.ai</a><br />Grant OS · A product of Huit.AI, LLC · Anchorage, Alaska</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex gap-6 text-sm">
          <Link href="/privacy" className="text-[#3B6E50] hover:underline">Privacy Policy</Link>
          <Link href="/auth/login" className="text-[#3B6E50] hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}

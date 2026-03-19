'use client'
import { useState } from 'react'
import Link from 'next/link'
import { TIERS, type PricingTier, type BillingInterval } from '@/lib/stripe'

const NONPROFIT_TIERS: PricingTier[] = ['seed', 'grow', 'scale']
const GOVT_TIERS: PricingTier[] = ['district', 'consortium', 'enterprise']

export default function BillingPage() {
  const [orgType, setOrgType] = useState<'nonprofit' | 'government'>('nonprofit')
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [selectedTier, setSelectedTier] = useState<PricingTier>('grow')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tiers = orgType === 'nonprofit' ? NONPROFIT_TIERS : GOVT_TIERS

  async function handleCheckout() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier, interval }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Checkout failed')
      }
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#0F2D1F] rounded-md flex items-center justify-center text-[#C8960C] font-bold text-sm">G</div>
            <span className="font-serif text-xl text-[#0F2D1F] font-bold">Grant OS</span>
          </div>
          <div className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            Subscription required
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#0F2D1F] mb-3">Activate your subscription</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Grant OS is a paid subscription platform. Select your plan to access all six modules.
            No free trial.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Org type toggle */}
        <div className="flex gap-2 p-1 bg-white border border-[#D4DDD7] rounded-lg mb-4">
          {(['nonprofit', 'government'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setOrgType(t); setSelectedTier(t === 'nonprofit' ? 'grow' : 'district') }}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all
                ${orgType === t ? 'bg-[#0F2D1F] text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'nonprofit' ? '🏢 Nonprofit' : '🏛️ School District & Government'}
            </button>
          ))}
        </div>

        {/* Interval toggle */}
        <div className="flex gap-2 p-1 bg-white border border-[#D4DDD7] rounded-lg mb-6 w-fit">
          {(['monthly', 'annual'] as const).map(i => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-all
                ${interval === i ? 'bg-[#EAF2EC] text-[#0F2D1F]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {i === 'monthly' ? 'Monthly' : 'Annual — save 15%'}
            </button>
          ))}
        </div>

        {/* Tier cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {tiers.map(tier => {
            const t = TIERS[tier]
            const price = interval === 'monthly' ? t.monthlyPrice : t.annualMonthly
            const isSelected = selectedTier === tier
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`text-left p-5 rounded-xl border-2 transition-all
                  ${isSelected ? 'border-[#3B6E50] bg-[#EAF2EC]' : 'border-[#D4DDD7] bg-white hover:border-[#3B6E50]/40'}`}
              >
                <div className="text-xs font-bold text-[#3B6E50] uppercase tracking-wider mb-2">{t.name}</div>
                <div className="text-3xl font-serif font-bold text-[#0F2D1F] mb-1">
                  ${price}<span className="text-sm font-sans font-normal text-gray-400">/mo</span>
                </div>
                {interval === 'annual' && (
                  <div className="text-xs text-[#3B6E50] font-semibold mb-3">
                    ${t.annualPrice.toLocaleString()}/year
                  </div>
                )}
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{t.description}</p>
                <ul className="space-y-1">
                  {t.features.slice(0, 3).map((f, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-[#3B6E50] font-bold mt-0.5">✓</span> {f}
                    </li>
                  ))}
                  {t.features.length > 3 && (
                    <li className="text-xs text-[#3B6E50] font-semibold">+{t.features.length - 3} more</li>
                  )}
                </ul>
              </button>
            )
          })}
        </div>

        {/* Selected summary + CTA */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-[#0F2D1F]">{TIERS[selectedTier].name} plan — {interval}</p>
              <p className="text-sm text-gray-500">{TIERS[selectedTier].description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-serif font-bold text-[#0F2D1F]">
                ${interval === 'monthly' ? TIERS[selectedTier].monthlyPrice : TIERS[selectedTier].annualMonthly}
                <span className="text-sm font-sans font-normal text-gray-400">/mo</span>
              </p>
              {interval === 'annual' && (
                <p className="text-xs text-[#3B6E50] font-semibold">Billed ${TIERS[selectedTier].annualPrice.toLocaleString()} annually</p>
              )}
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base"
          >
            {loading ? 'Redirecting to checkout...' : `Activate ${TIERS[selectedTier].name} →`}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Secure payment via Stripe. Credit card or ACH. Purchase orders accepted for school districts —{' '}
            <a href="mailto:billing@grantos.ai" className="text-[#3B6E50] hover:underline">billing@grantos.ai</a>
          </p>
        </div>

        {/* Legal notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-xs text-yellow-800 leading-relaxed">
            <strong>AI Content Notice:</strong> Grant OS uses AI to assist in drafting grant narratives. All AI-generated content
            requires mandatory user attestation before use. False statements submitted to federal agencies may violate 18 U.S.C. § 1001
            and the False Claims Act. By subscribing you agree to our{' '}
            <Link href="/terms" className="underline">Terms of Service</Link>.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link href="/auth/login" className="hover:text-gray-600">← Back to login</Link>
          {' · '}
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          {' · '}
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}

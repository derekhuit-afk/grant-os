'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { TIERS, type PricingTier, type BillingInterval } from '@/lib/stripe'

const NONPROFIT_TIERS: PricingTier[] = ['seed', 'grow', 'scale']
const GOVT_TIERS: PricingTier[] = ['district', 'consortium', 'enterprise']

export default function SignupPage() {
  const router = useRouter()
  const supabase = createBrowserClient()

  const [step, setStep] = useState<'plan' | 'account'>('plan')
  const [selectedTier, setSelectedTier] = useState<PricingTier>('grow')
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [orgType, setOrgType] = useState<'nonprofit' | 'government'>('nonprofit')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const tiers = orgType === 'nonprofit' ? NONPROFIT_TIERS : GOVT_TIERS

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { org_name: orgName, selected_tier: selectedTier, org_type: orgType } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    // Redirect to billing checkout
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: selectedTier, interval, email, orgName }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else { setError('Failed to create checkout session.'); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0F2D1F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#C8960C] rounded-md flex items-center justify-center text-[#0F2D1F] font-bold text-sm">G</div>
            <span className="font-serif text-xl text-white font-bold">Grant OS</span>
          </div>
          <h1 className="text-2xl text-white font-serif font-bold">
            {step === 'plan' ? 'Choose your plan' : 'Create your account'}
          </h1>
          <p className="text-white/60 text-sm mt-2">No free trial. Subscription access only.</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-2xl">
          {step === 'plan' && (
            <>
              {/* Org type toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
                {(['nonprofit', 'government'] as const).map(t => (
                  <button key={t} onClick={() => { setOrgType(t); setSelectedTier(t === 'nonprofit' ? 'grow' : 'district') }}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${orgType === t ? 'bg-white text-[#0F2D1F] shadow-sm' : 'text-gray-500'}`}>
                    {t === 'nonprofit' ? 'Nonprofit' : 'School District / Government'}
                  </button>
                ))}
              </div>

              {/* Interval toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
                {(['monthly', 'annual'] as const).map(i => (
                  <button key={i} onClick={() => setInterval(i)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${interval === i ? 'bg-white text-[#0F2D1F] shadow-sm' : 'text-gray-500'}`}>
                    {i === 'monthly' ? 'Monthly' : 'Annual (save 15%)'}
                  </button>
                ))}
              </div>

              {/* Tier cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {tiers.map(tier => {
                  const t = TIERS[tier]
                  const price = interval === 'monthly' ? t.monthlyPrice : t.annualMonthly
                  return (
                    <button key={tier} onClick={() => setSelectedTier(tier)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${selectedTier === tier ? 'border-[#3B6E50] bg-[#EAF2EC]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="text-xs font-bold text-[#3B6E50] uppercase tracking-wider mb-1">{t.name}</div>
                      <div className="text-2xl font-serif font-bold text-[#0F2D1F]">${price}<span className="text-sm font-sans font-normal text-gray-500">/mo</span></div>
                      <div className="text-xs text-gray-500 mt-1">{t.seats === 999 ? 'Unlimited' : t.seats} seat{t.seats !== 1 ? 's' : ''}</div>
                    </button>
                  )
                })}
              </div>

              <button onClick={() => setStep('account')} className="btn-primary w-full py-3">
                Continue with {TIERS[selectedTier].name} →
              </button>
            </>
          )}

          {step === 'account' && (
            <form onSubmit={handleSignup} className="space-y-5">
              <button type="button" onClick={() => setStep('plan')} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
                ← Back to plans
              </button>

              <div className="bg-[#EAF2EC] rounded-lg px-4 py-3 text-sm text-[#0F2D1F]">
                <strong>{TIERS[selectedTier].name}</strong> · ${interval === 'monthly' ? TIERS[selectedTier].monthlyPrice : TIERS[selectedTier].annualMonthly}/mo · {interval}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div>
                <label className="label">Organization name</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)} className="input" placeholder="Community Action Network" required />
              </div>
              <div>
                <label className="label">Work email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@organization.org" required />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="Min. 8 characters" minLength={8} required />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-xs text-yellow-800 leading-relaxed">
                <strong>Before you continue:</strong> Grant OS uses AI to generate grant narratives. All AI-generated content requires mandatory user review and attestation before use. Submitting false statements to federal agencies carries serious legal risk. By creating an account you agree to our <Link href="/terms" target="_blank" className="underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="underline">Privacy Policy</Link>.
              </div>

              <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account & continue to payment →'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-white/60 hover:text-white underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

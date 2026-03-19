import Stripe from 'stripe'

// Lazy initialization — never called at build time, only at request time
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2024-04-10', typescript: true })
  }
  return _stripe
}

export type PricingTier =
  | 'seed' | 'grow' | 'scale'
  | 'district' | 'consortium' | 'enterprise'

export type BillingInterval = 'monthly' | 'annual'

export interface TierConfig {
  name: string
  division: 'nonprofit' | 'government'
  monthlyPrice: number
  annualPrice: number
  annualMonthly: number
  description: string
  seats: number
  features: string[]
}

export const TIERS: Record<PricingTier, TierConfig> = {
  seed: {
    name: 'Seed',
    division: 'nonprofit',
    monthlyPrice: 299,
    annualPrice: 3052,
    annualMonthly: 254,
    description: 'Small nonprofits managing 1–5 active grants',
    seats: 1,
    features: [
      'Command Center dashboard',
      'Grant Discovery Engine',
      'AI Narrative Builder (10 drafts/mo)',
      'Pipeline Kanban (up to 10 grants)',
      'Compliance Monitor — basic alerts',
      '990 / FAC data lookup',
    ],
  },
  grow: {
    name: 'Grow',
    division: 'nonprofit',
    monthlyPrice: 549,
    annualPrice: 5600,
    annualMonthly: 467,
    description: 'Mid-size nonprofits with dedicated grant staff',
    seats: 3,
    features: [
      'Everything in Seed',
      'AI Narrative Builder — unlimited',
      'GEPA Section 427 workflow module',
      'Full OMB Uniform Guidance tracking',
      'Single Audit threshold monitoring',
      '3 user seats',
    ],
  },
  scale: {
    name: 'Scale',
    division: 'nonprofit',
    monthlyPrice: 799,
    annualPrice: 8150,
    annualMonthly: 679,
    description: 'Large nonprofits with multi-funder portfolios',
    seats: 10,
    features: [
      'Everything in Grow',
      'Multi-program portfolio view',
      'Full FAC audit history integration',
      'Budget justification AI drafting',
      'Subrecipient monitoring tools',
      '10 user seats',
    ],
  },
  district: {
    name: 'District',
    division: 'government',
    monthlyPrice: 999,
    annualPrice: 10190,
    annualMonthly: 849,
    description: 'Single LEA or local government agency',
    seats: 5,
    features: [
      'Full 6-module platform access',
      'ESSA and IDEA compliance tracking',
      'GEPA Section 427 workflow',
      'Single Audit monitoring + FAC',
      'SAM.gov / UEI management',
      'Purchase Order billing available',
    ],
  },
  consortium: {
    name: 'Consortium',
    division: 'government',
    monthlyPrice: 1750,
    annualPrice: 17850,
    annualMonthly: 1488,
    description: 'Multi-district consortia and county offices',
    seats: 15,
    features: [
      'Everything in District',
      'Multi-district portfolio management',
      'Consortium-level compliance reporting',
      'Multi-site performance dashboards',
      '15 user seats across entities',
      'Priority support — 4-hour SLA',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    division: 'government',
    monthlyPrice: 2500,
    annualPrice: 25500,
    annualMonthly: 2125,
    description: 'State agencies and large urban districts',
    seats: 999,
    features: [
      'Everything in Consortium',
      'Custom integrations',
      'Unlimited user seats',
      'Dedicated account management',
      'Custom onboarding and training',
      'SLA-backed uptime guarantee',
    ],
  },
}

export function getPriceId(tier: PricingTier, interval: BillingInterval): string {
  const key = `STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()}`
  const priceId = process.env[key]
  if (!priceId) throw new Error(`Missing Stripe price ID for ${tier} ${interval}`)
  return priceId
}

export async function createCheckoutSession({
  customerId,
  tier,
  interval,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  customerId?: string
  tier: PricingTier
  interval: BillingInterval
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}) {
  const stripe = getStripe()
  const priceId = getPriceId(tier, interval)

  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: { metadata: { tier, interval } },
    metadata: { tier, interval },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    payment_method_types: ['card', 'us_bank_account'],
  })
}

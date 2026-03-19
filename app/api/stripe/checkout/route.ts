import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, type PricingTier, type BillingInterval } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { tier, interval, email, orgName } = await req.json()

    if (!tier || !interval || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if Stripe customer already exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('email', email)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grantos.ai'

    const session = await createCheckoutSession({
      customerId: profile?.stripe_customer_id || undefined,
      customerEmail: profile?.stripe_customer_id ? undefined : email,
      tier: tier as PricingTier,
      interval: interval as BillingInterval,
      successUrl: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/auth/signup`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendSubscriptionConfirmation } from '@/lib/resend'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const tier = session.metadata?.tier || 'grow'
        const interval = session.metadata?.interval || 'monthly'

        await supabase.from('profiles').update({
          subscription_status: 'active',
          subscription_tier: tier,
          subscription_interval: interval,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        }).eq('email', session.customer_email!)

        const { data: profile } = await supabase
          .from('profiles')
          .select('email, org_name')
          .eq('stripe_customer_id', session.customer as string)
          .single()

        if (profile) {
          const periodEnd = new Date((subscription as any).current_period_end * 1000)
          await sendSubscriptionConfirmation({
            to: profile.email,
            orgName: profile.org_name || 'Your Organization',
            tier: tier.charAt(0).toUpperCase() + tier.slice(1),
            interval,
            amount: session.amount_total || 0,
            nextBillingDate: periodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : subscription.status === 'canceled' ? 'canceled'
          : 'inactive'

        await supabase.from('profiles').update({
          subscription_status: status,
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabase.from('profiles').update({
          subscription_status: 'canceled',
          stripe_subscription_id: null,
        }).eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await supabase.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('stripe_customer_id', invoice.customer as string)
        break
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err.message)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

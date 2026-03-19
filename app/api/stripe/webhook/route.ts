import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { sendSubscriptionConfirmation } from '@/lib/resend'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createServiceClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const tier = (subscription.metadata.tier || session.metadata?.tier || 'seed') as string
      const interval = (subscription.metadata.interval || session.metadata?.interval || 'monthly') as string
      const customerEmail = session.customer_email || ''

      // Update profile with subscription data
      await supabase.from('profiles').update({
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: 'active',
        subscription_tier: tier,
        subscription_interval: interval,
      }).eq('email', customerEmail)

      // Send confirmation email
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_name, email')
        .eq('email', customerEmail)
        .single()

      if (profile) {
        await sendSubscriptionConfirmation({
          to: customerEmail,
          orgName: profile.org_name || customerEmail,
          tier,
          interval,
          amount: subscription.items.data[0].price.unit_amount || 0,
          nextBillingDate: new Date((subscription.current_period_end) * 1000).toLocaleDateString(),
        })
      }
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabase.from('profiles').update({
        subscription_status: 'active',
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabase.from('profiles').update({
        subscription_status: 'past_due',
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      await supabase.from('profiles').update({
        subscription_status: 'canceled',
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', customerId)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      const tier = subscription.metadata.tier

      await supabase.from('profiles').update({
        subscription_status: subscription.status as any,
        subscription_tier: tier,
      }).eq('stripe_customer_id', customerId)
      break
    }
  }

  return NextResponse.json({ received: true })
}

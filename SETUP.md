# GRANT OS — SETUP GUIDE

Complete these steps in order. Budget approximately 2–3 hours for first-time setup.

---

## STEP 1 — SUPABASE (Database + Auth)

1. Go to **https://supabase.com** → Sign in or create account
2. Click **"New project"**
   - Name: `grant-os`
   - Database password: generate a strong one and save it
   - Region: West US (or closest to your users)
3. Wait for project to provision (~2 min)
4. Go to **Settings → API**
   - Copy `Project URL` → paste into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` key → paste as `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **SQL Editor → New Query**
   - Paste the entire contents of `supabase/migration.sql`
   - Click **Run**
   - Verify: green "Success" message, no errors
6. Go to **Authentication → Settings**
   - Enable **Email provider**
   - Set Site URL to `https://grantos.ai` (or your Vercel URL during dev)
   - Add `https://grantos.ai/auth/callback` to Redirect URLs

---

## STEP 2 — STRIPE (Billing)

1. Go to **https://dashboard.stripe.com** → Sign in or create account
2. Complete account verification (required for live payments)
3. **API Keys** → Developers → API Keys
   - Copy **Publishable key** → `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy **Secret key** → `.env.local` as `STRIPE_SECRET_KEY`

### Create Products (12 total)

Go to **Products → Add product** for each tier below:

**Nonprofit Division:**

| Name | Monthly Price | Annual Price |
|------|--------------|--------------|
| Grant OS — Seed | $299 | $3,052 |
| Grant OS — Grow | $549 | $5,600 |
| Grant OS — Scale | $799 | $8,150 |

**School District & Government Division:**

| Name | Monthly Price | Annual Price |
|------|--------------|--------------|
| Grant OS — District | $999 | $10,190 |
| Grant OS — Consortium | $1,750 | $17,850 |
| Grant OS — Enterprise | $2,500 | $25,500 |

For each product:
- Set billing period: **Monthly** (create a separate price for Annual)
- Copy each Price ID (starts with `price_`) into `.env.local`

### Configure Webhook

4. Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://grantos.ai/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
5. Copy **Signing secret** → `.env.local` as `STRIPE_WEBHOOK_SECRET`

---

## STEP 3 — ANTHROPIC API (AI Narrative Builder)

1. Go to **https://console.anthropic.com** → Sign in or create account
2. Go to **API Keys → Create key**
   - Name: `grant-os-production`
3. Copy key → `.env.local` as `ANTHROPIC_API_KEY`
4. Add a billing method and set a monthly spend limit (recommend $100–$500 to start)

---

## STEP 4 — RESEND (Transactional Email)

1. Go to **https://resend.com** → Sign in or create account
2. Go to **Domains → Add domain**
   - Add `grantos.ai`
   - Follow DNS verification instructions (add the DNS records to your domain registrar)
   - Wait for verification (5–30 min)
3. Go to **API Keys → Create API Key**
   - Name: `grant-os-production`
   - Permission: **Full access**
4. Copy key → `.env.local` as `RESEND_API_KEY`
5. Set `EMAIL_FROM=Grant OS <noreply@grantos.ai>` in `.env.local`

---

## STEP 5 — DOMAIN (grantos.ai or similar)

1. Purchase `grantos.ai` at Namecheap, Cloudflare Registrar, or Google Domains
2. After Vercel deployment (Step 6), point the domain to Vercel:
   - Add the domain in **Vercel → Project → Settings → Domains**
   - Update DNS records as directed by Vercel

---

## STEP 6 — GITHUB REPO

```bash
# In the grant-os directory:
git init
git add .
git commit -m "Initial Grant OS build"
git branch -M main

# Create repo at github.com then:
git remote add origin https://github.com/YOUR_USERNAME/grant-os.git
git push -u origin main
```

---

## STEP 7 — VERCEL (Deployment)

1. Go to **https://vercel.com** → Sign in with GitHub
2. Click **Add New → Project**
3. Import the `grant-os` GitHub repository
4. **Environment Variables** — add all values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL first, then update to grantos.ai)
5. Click **Deploy**
6. Wait for build (~2–3 min)
7. Copy the Vercel URL (e.g., `grant-os-xyz.vercel.app`)
8. Go back to Supabase → Authentication → Settings → update Site URL and Redirect URLs to your live URL

---

## STEP 8 — POST-DEPLOY VERIFICATION CHECKLIST

Run through each of these after deployment:

- [ ] Visit `/auth/signup` — create a test account
- [ ] Complete Stripe checkout with a test card (`4242 4242 4242 4242`)
- [ ] Confirm subscription confirmation email arrives
- [ ] Complete onboarding wizard
- [ ] Reach dashboard — all 6 modules visible
- [ ] Generate a test narrative in AI Builder
- [ ] Complete attestation modal — confirm log appears in Supabase `attestation_logs` table
- [ ] Confirm attestation email arrives
- [ ] Visit `/privacy` and `/terms` — both render correctly
- [ ] Test sign out and sign in

---

## LIVE URLS AFTER DEPLOYMENT

| Page | URL |
|------|-----|
| Landing page | https://grantos.ai |
| Sign up | https://grantos.ai/auth/signup |
| Log in | https://grantos.ai/auth/login |
| Dashboard | https://grantos.ai/dashboard |
| Privacy Policy | https://grantos.ai/privacy |
| Terms of Service | https://grantos.ai/terms |

---

## SENDING TO THE 3 INBOUND LEADS NOW

Before full deployment, you can convert the 3 inbound leads manually:

1. Send them the landing page HTML (already built)
2. Email them directly with pricing and a payment link:
   - Create a **Stripe Payment Link** for their specific tier (Dashboard → Payment Links)
   - Send the link with a note that their account will be activated within 24 hours
3. Once they pay, create their Supabase account manually and set `subscription_status = 'active'`

---

## SUPPORT CONTACTS

- Platform: support@grantos.ai
- Billing: billing@grantos.ai
- Legal: legal@grantos.ai
- Privacy: privacy@grantos.ai

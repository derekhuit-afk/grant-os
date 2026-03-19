import { Resend } from 'resend'

// Lazy init — never instantiated at build time, only at request time
function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const FROM = process.env.EMAIL_FROM || 'Grant OS <noreply@grantos.ai>'

export async function sendWelcomeEmail({
  to,
  orgName,
  tier,
}: {
  to: string
  orgName: string
  tier: string
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Welcome to Grant OS — your federal grant intelligence platform',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0F2D1F; padding: 32px 40px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C8960C; font-size: 24px; margin: 0;">Grant OS</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Federal Grant Intelligence Platform</p>
        </div>
        <div style="background: #F9F7F2; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #D4DDD7; border-top: none;">
          <h2 style="color: #0F2D1F; font-size: 22px;">Welcome, ${orgName}.</h2>
          <p style="color: #3A4A3F; line-height: 1.7;">Your Grant OS account is active. You're on the <strong>${tier}</strong> plan.</p>
          <p style="color: #3A4A3F; line-height: 1.7;">Your next step is completing your organization profile — this unlocks grant matching, compliance monitoring, and your AI narrative builder.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" style="display: inline-block; background: #0F2D1F; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">Complete your profile →</a>
          <hr style="border: none; border-top: 1px solid #D4DDD7; margin: 32px 0;"/>
          <p style="color: #6B7E72; font-size: 13px; line-height: 1.6;"><strong>Important:</strong> All AI-generated content produced by Grant OS is advisory only. You must review and verify all content before submission to any funding agency. Completing your User Attestation is required before submitting any AI-generated narrative. See our <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" style="color: #3B6E50;">Terms of Service</a> for full details.</p>
          <p style="color: #6B7E72; font-size: 13px;">Questions? Reply to this email or contact <a href="mailto:support@grantos.ai" style="color: #3B6E50;">support@grantos.ai</a></p>
        </div>
      </div>
    `,
  })
}

export async function sendSubscriptionConfirmation({
  to,
  orgName,
  tier,
  interval,
  amount,
  nextBillingDate,
}: {
  to: string
  orgName: string
  tier: string
  interval: string
  amount: number
  nextBillingDate: string
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Grant OS — subscription confirmed (${tier} plan)`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0F2D1F; padding: 32px 40px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C8960C; font-size: 24px; margin: 0;">Grant OS</h1>
        </div>
        <div style="background: #F9F7F2; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #D4DDD7; border-top: none;">
          <h2 style="color: #0F2D1F;">Subscription confirmed</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #D4DDD7;"><td style="padding: 10px 0; color: #6B7E72;">Organization</td><td style="padding: 10px 0; font-weight: bold;">${orgName}</td></tr>
            <tr style="border-bottom: 1px solid #D4DDD7;"><td style="padding: 10px 0; color: #6B7E72;">Plan</td><td style="padding: 10px 0; font-weight: bold;">${tier}</td></tr>
            <tr style="border-bottom: 1px solid #D4DDD7;"><td style="padding: 10px 0; color: #6B7E72;">Billing</td><td style="padding: 10px 0;">${interval}</td></tr>
            <tr style="border-bottom: 1px solid #D4DDD7;"><td style="padding: 10px 0; color: #6B7E72;">Amount</td><td style="padding: 10px 0;">$${(amount / 100).toFixed(2)}</td></tr>
            <tr><td style="padding: 10px 0; color: #6B7E72;">Next billing</td><td style="padding: 10px 0;">${nextBillingDate}</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #0F2D1F; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">Go to dashboard →</a>
        </div>
      </div>
    `,
  })
}

export async function sendOnboardingDay3({
  to,
  orgName,
}: {
  to: string
  orgName: string
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Have you tried the Grant Discovery Engine yet?',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0F2D1F; padding: 32px 40px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C8960C; font-size: 24px; margin: 0;">Grant OS</h1>
        </div>
        <div style="background: #F9F7F2; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #D4DDD7; border-top: none;">
          <h2 style="color: #0F2D1F;">Hi ${orgName},</h2>
          <p style="color: #3A4A3F; line-height: 1.7;">It's been a few days. Here are the three things most organizations do first in Grant OS:</p>
          <ol style="color: #3A4A3F; line-height: 2;">
            <li>Run a <strong>Grant Discovery</strong> search matched to your NTEE code and geography</li>
            <li>Add your first active grant to the <strong>Pipeline Kanban</strong></li>
            <li>Use the <strong>AI Narrative Builder</strong> to draft a needs statement — then complete your attestation</li>
          </ol>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/discovery" style="display: inline-block; background: #0F2D1F; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0;">Start with grant discovery →</a>
          <p style="color: #6B7E72; font-size: 13px;">Questions? <a href="mailto:support@grantos.ai" style="color: #3B6E50;">support@grantos.ai</a></p>
        </div>
      </div>
    `,
  })
}

export async function sendAttestationConfirmation({
  to,
  orgName,
  contentType,
  attestedAt,
  attestationId,
}: {
  to: string
  orgName: string
  contentType: string
  attestedAt: string
  attestationId: string
}) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Grant OS — AI content attestation confirmed',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0F2D1F; padding: 32px 40px; border-radius: 8px 8px 0 0;">
          <h1 style="color: #C8960C; font-size: 24px; margin: 0;">Grant OS</h1>
        </div>
        <div style="background: #FFF8E7; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #F59E0B; border-top: none;">
          <h2 style="color: #0F2D1F;">Attestation record confirmed</h2>
          <p style="color: #3A4A3F; line-height: 1.7;">This email confirms that <strong>${orgName}</strong> completed a user attestation for AI-generated grant content.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #F59E0B;"><td style="padding: 10px 0; color: #92400E;">Attestation ID</td><td style="padding: 10px 0; font-family: monospace; font-size: 12px;">${attestationId}</td></tr>
            <tr style="border-bottom: 1px solid #F59E0B;"><td style="padding: 10px 0; color: #92400E;">Content type</td><td style="padding: 10px 0;">${contentType}</td></tr>
            <tr><td style="padding: 10px 0; color: #92400E;">Timestamp</td><td style="padding: 10px 0;">${attestedAt}</td></tr>
          </table>
          <p style="color: #92400E; font-size: 13px; line-height: 1.6;"><strong>Reminder:</strong> This attestation confirms that an authorized representative of your organization reviewed and verified the accuracy of AI-generated content before use. Keep this record for your compliance files.</p>
        </div>
      </div>
    `,
  })
}

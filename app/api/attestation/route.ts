export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { sendAttestationConfirmation } from '@/lib/resend'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contentType, narrativeId, itemsConfirmed } = await req.json()

    if (!contentType || !itemsConfirmed?.length) {
      return NextResponse.json({ error: 'Missing required attestation data' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_name, email')
      .eq('id', user.id)
      .single()

    // Hash IP for privacy-preserving logging
    const forwardedFor = req.headers.get('x-forwarded-for') || ''
    const ipHash = createHash('sha256').update(forwardedFor).digest('hex').substring(0, 16)
    const uaHash = createHash('sha256').update(req.headers.get('user-agent') || '').digest('hex').substring(0, 16)

    // Insert attestation log (append-only — delete rule prevents removal)
    const { data: log, error: logError } = await supabase
      .from('attestation_logs')
      .insert({
        user_id: user.id,
        org_name: profile?.org_name || user.email || '',
        email: profile?.email || user.email || '',
        content_type: contentType,
        narrative_id: narrativeId || null,
        ip_hash: ipHash,
        user_agent_hash: uaHash,
        items_confirmed: itemsConfirmed,
      })
      .select('id, attested_at')
      .single()

    if (logError) {
      console.error('Attestation log error:', logError)
      return NextResponse.json({ error: 'Failed to log attestation' }, { status: 500 })
    }

    // Mark narrative as attested
    if (narrativeId) {
      await supabase.from('narratives').update({
        attested: true,
        attestation_id: log.id,
      }).eq('id', narrativeId).eq('user_id', user.id)
    }

    // Send attestation confirmation email
    if (profile?.email) {
      await sendAttestationConfirmation({
        to: profile.email,
        orgName: profile.org_name || '',
        contentType,
        attestedAt: new Date(log.attested_at).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'long' }),
        attestationId: log.id,
      })
    }

    return NextResponse.json({
      success: true,
      attestationId: log.id,
      attestedAt: log.attested_at,
    })
  } catch (error: any) {
    console.error('Attestation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

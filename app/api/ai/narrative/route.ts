export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPTS: Record<string, string> = {
  needs_statement: `You are a professional grant writer helping nonprofit organizations and public school districts write compelling federal grant applications. Generate a needs statement that is evidence-based, specific to the described population and context, and appropriate for federal funding agencies. Use clear, professional language. Include data-driven assertions only where the user has provided supporting context. Do NOT invent specific statistics or data not provided by the user — note where data should be inserted by the applicant.`,

  project_description: `You are a professional grant writer. Generate a clear, outcomes-focused project description for a federal grant application. Structure it with: (1) project overview, (2) target population, (3) activities and timeline, (4) expected outcomes. Flag any sections where the applicant must insert verified organizational data.`,

  goals_objectives: `You are a professional grant writer. Generate SMART goals and measurable objectives for a federal grant application. Use the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound). Include at least 2 goals with 2-3 objectives each. Note where specific targets must be confirmed by the applicant.`,

  evaluation_plan: `You are a professional grant writer. Generate an evaluation plan for a federal grant application including: (1) evaluation questions, (2) data collection methods, (3) timeline, (4) who will conduct the evaluation, (5) how findings will be used. Note where applicant-specific information must be inserted.`,

  gepa_427: `You are a professional grant writer specializing in U.S. Department of Education grants. Generate a GEPA Section 427 equitable access and participation plan. Address barriers for students, teachers, and program beneficiaries based on gender, race, national origin, color, disability, and age. IMPORTANT: Include a prominent note that this draft MUST be substantially customized to reflect the applicant's specific program, demographics, and equity strategy before submission. This is a starting point only.`,

  budget_justification: `You are a professional grant writer. Generate a budget narrative/justification for a federal grant application. Address allowability under OMB Uniform Guidance (2 CFR Part 200 Subpart E) — each cost must be allowable, allocable, and reasonable. Use standard federal budget categories: Personnel, Fringe Benefits, Travel, Equipment, Supplies, Contractual, Other Direct Costs, Indirect Costs. Flag where actual dollar amounts must be inserted.`,

  grant_discovery: `You are a federal grants database assistant. The user is searching for grant opportunities. Return ONLY a valid JSON array (no other text, no markdown) of 6 realistic grant opportunities matching the search criteria. Each object: {id: "uuid-format", title: string, funder: string, funder_type: "federal"|"state"|"foundation"|"private", amount_min: number, amount_max: number, deadline: "ISO-date", program_type: string, eligibility: string, description: "2 sentences", cfda: "XX.XXX or empty string", match_score: 60-98}`,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, org_name')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const { narrativeType, prompt } = await req.json()

    if (!narrativeType || !prompt) {
      return NextResponse.json({ error: 'Missing narrativeType or prompt' }, { status: 400 })
    }

    const systemPrompt = SYSTEM_PROMPTS[narrativeType] || SYSTEM_PROMPTS.needs_statement

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens

    // Save to database (except discovery searches)
    let narrativeId = null
    if (narrativeType !== 'grant_discovery') {
      const { data: narrative } = await supabase.from('narratives').insert({
        user_id: user.id,
        narrative_type: narrativeType,
        prompt_input: prompt,
        generated_content: content,
        attested: false,
        model_used: 'claude-sonnet-4-20250514',
        tokens_used: tokensUsed,
      }).select('id').single()

      narrativeId = narrative?.id
    }

    return NextResponse.json({ content, narrativeId, tokensUsed })
  } catch (error: any) {
    console.error('AI narrative error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

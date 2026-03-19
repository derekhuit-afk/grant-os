'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

const STEPS = [
  { id: 1, title: 'Organization profile', description: 'Tell us about your organization' },
  { id: 2, title: 'Federal identifiers', description: 'EIN, UEI, and SAM.gov status' },
  { id: 3, title: 'Grant history', description: 'Help us calibrate your compliance monitoring' },
  { id: 4, title: 'Compliance acknowledgment', description: 'Required before using AI tools' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [orgName, setOrgName] = useState('')
  const [orgType, setOrgType] = useState<'nonprofit' | 'school_district' | 'government'>('nonprofit')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [website, setWebsite] = useState('')
  const [ein, setEin] = useState('')
  const [uei, setUei] = useState('')
  const [samGovActive, setSamGovActive] = useState(false)
  const [samGovExpiry, setSamGovExpiry] = useState('')
  const [federalExpenditures, setFederalExpenditures] = useState('')
  const [singleAuditRequired, setSingleAuditRequired] = useState(false)
  const [acknowledged, setAcknowledged] = useState([false, false, false, false, false])

  const allAcknowledged = acknowledged.every(Boolean)

  async function handleComplete() {
    if (!allAcknowledged) return
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expired. Please log in again.'); setSaving(false); return }

    const { error: updateError } = await supabase.from('profiles').update({
      org_name: orgName,
      org_type: orgType,
      state,
      city,
      website,
      ein,
      uei,
      sam_gov_active: samGovActive,
      sam_gov_expiry: samGovExpiry || null,
      federal_expenditures_last_fy: federalExpenditures ? parseFloat(federalExpenditures) : null,
      single_audit_required: singleAuditRequired,
      onboarding_complete: true,
      onboarding_step: 4,
    }).eq('id', user.id)

    if (updateError) { setError(updateError.message); setSaving(false); return }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#0F2D1F] rounded-md flex items-center justify-center text-[#C8960C] font-bold text-sm">G</div>
            <span className="font-serif text-xl text-[#0F2D1F] font-bold">Grant OS</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">Complete your organization profile</h1>
          <p className="text-gray-500 text-sm mt-2">Takes about 5 minutes. Required to activate all modules.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step > s.id ? 'bg-[#3B6E50] text-white' : step === s.id ? 'bg-[#0F2D1F] text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-[#3B6E50]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          <h2 className="text-lg font-serif font-bold text-[#0F2D1F] mb-1">{STEPS[step-1].title}</h2>
          <p className="text-sm text-gray-500 mb-6">{STEPS[step-1].description}</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

          {/* Step 1: Org profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="label">Organization name *</label>
                <input value={orgName} onChange={e => setOrgName(e.target.value)} className="input" placeholder="Community Action Network" required />
              </div>
              <div>
                <label className="label">Organization type *</label>
                <select value={orgType} onChange={e => setOrgType(e.target.value as typeof orgType)} className="input">
                  <option value="nonprofit">Nonprofit (501(c)(3) or similar)</option>
                  <option value="school_district">School District / LEA</option>
                  <option value="government">Local / State Government Agency</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input value={city} onChange={e => setCity(e.target.value)} className="input" placeholder="Anchorage" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input value={state} onChange={e => setState(e.target.value)} className="input" placeholder="AK" maxLength={2} />
                </div>
              </div>
              <div>
                <label className="label">Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} className="input" placeholder="https://yourorg.org" />
              </div>
            </div>
          )}

          {/* Step 2: Federal identifiers */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-[#EAF2EC] rounded-lg px-4 py-3 text-sm text-[#0F2D1F]">
                Your EIN and UEI are required for most federal grant applications and SAM.gov registration.
              </div>
              <div>
                <label className="label">Employer Identification Number (EIN)</label>
                <input value={ein} onChange={e => setEin(e.target.value)} className="input" placeholder="12-3456789" />
              </div>
              <div>
                <label className="label">Unique Entity Identifier (UEI)</label>
                <input value={uei} onChange={e => setUei(e.target.value)} className="input" placeholder="12 characters" maxLength={12} />
                <p className="text-xs text-gray-400 mt-1">Find your UEI at SAM.gov</p>
              </div>
              <div>
                <label className="label">SAM.gov registration status</label>
                <div className="flex gap-4">
                  {[true, false].map(val => (
                    <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={samGovActive === val} onChange={() => setSamGovActive(val)} />
                      <span className="text-sm">{val ? 'Active' : 'Inactive / Not registered'}</span>
                    </label>
                  ))}
                </div>
              </div>
              {samGovActive && (
                <div>
                  <label className="label">SAM.gov expiration date</label>
                  <input type="date" value={samGovExpiry} onChange={e => setSamGovExpiry(e.target.value)} className="input" />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Grant history */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
                This information helps Grant OS configure your Single Audit monitoring threshold and compliance alerts.
              </div>
              <div>
                <label className="label">Federal expenditures last fiscal year (approximate)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" value={federalExpenditures} onChange={e => setFederalExpenditures(e.target.value)}
                    className="input pl-7" placeholder="750000" />
                </div>
                <p className="text-xs text-gray-400 mt-1">$1,000,000+ triggers Single Audit requirement under 31 U.S.C. § 7502</p>
              </div>
              <div>
                <label className="label">Are you currently required to obtain a Single Audit?</label>
                <div className="flex gap-4">
                  {[true, false].map(val => (
                    <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={singleAuditRequired === val} onChange={() => setSingleAuditRequired(val)} />
                      <span className="text-sm">{val ? 'Yes' : 'No / Unsure'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Compliance acknowledgment */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800 leading-relaxed">
                <strong>Required acknowledgment.</strong> Read and confirm each item to activate your Grant OS account and AI tools.
              </div>
              <ul className="space-y-0 border border-gray-200 rounded-xl overflow-hidden">
                {[
                  'I understand that all AI-generated content from Grant OS is advisory only and must be reviewed and verified before use in any grant application.',
                  'I understand that submitting false or misleading statements to a federal agency may violate 18 U.S.C. § 1001 (False Statements) and the False Claims Act.',
                  'I have read the Grant OS Federal Compliance Acknowledgment covering OMB Uniform Guidance (2 CFR Part 200) and GEPA Section 427.',
                  'I will complete the in-platform User Attestation before finalizing any AI-generated narrative content.',
                  'My organization, not Huit.AI LLC or Grant OS, bears sole legal responsibility for all grant applications submitted to funding agencies.',
                ].map((item, i) => (
                  <li key={i} onClick={() => {
                    const next = [...acknowledged]
                    next[i] = !next[i]
                    setAcknowledged(next)
                  }} className={`flex items-start gap-3 px-5 py-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors
                    ${acknowledged[i] ? 'bg-[#EAF2EC]' : 'hover:bg-gray-50'}`}>
                    <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all
                      ${acknowledged[i] ? 'bg-[#3B6E50] border-[#3B6E50]' : 'border-gray-300'}`}>
                      {acknowledged[i] && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-outline px-6">← Back</button>
            )}
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !orgName}
                className="btn-primary flex-1 py-3">
                Continue →
              </button>
            ) : (
              <button onClick={handleComplete} disabled={!allAcknowledged || saving}
                className="btn-primary flex-1 py-3">
                {saving ? 'Activating your account...' : 'Complete setup & go to dashboard →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

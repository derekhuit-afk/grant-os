'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

export default function OrgProfileClient({ profile }: { profile: any }) {
  const supabase = createBrowserClient()
  const [form, setForm] = useState({
    org_name: profile?.org_name || '',
    org_type: profile?.org_type || 'nonprofit',
    ein: profile?.ein || '',
    uei: profile?.uei || '',
    state: profile?.state || '',
    city: profile?.city || '',
    website: profile?.website || '',
    sam_gov_active: profile?.sam_gov_active || false,
    sam_gov_expiry: profile?.sam_gov_expiry || '',
    federal_expenditures_last_fy: profile?.federal_expenditures_last_fy || '',
    single_audit_required: profile?.single_audit_required || false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({
      ...form,
      federal_expenditures_last_fy: form.federal_expenditures_last_fy ? parseFloat(String(form.federal_expenditures_last_fy)) : null,
      sam_gov_expiry: form.sam_gov_expiry || null,
    }).eq('id', user!.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const field = (key: keyof typeof form) => ({
    value: String(form[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value })),
  })

  return (
    <div className="space-y-6">
      {/* Org info */}
      <div className="card">
        <h2 className="font-serif font-bold text-[#0F2D1F] mb-5">Organization information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Organization name</label>
            <input className="input" {...field('org_name')} />
          </div>
          <div>
            <label className="label">Organization type</label>
            <select className="input" {...field('org_type')}>
              <option value="nonprofit">Nonprofit (501(c)(3))</option>
              <option value="school_district">School District / LEA</option>
              <option value="government">Local / State Government</option>
            </select>
          </div>
          <div>
            <label className="label">Website</label>
            <input className="input" {...field('website')} placeholder="https://" />
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" {...field('city')} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" {...field('state')} maxLength={2} placeholder="AK" />
          </div>
        </div>
      </div>

      {/* Federal identifiers */}
      <div className="card">
        <h2 className="font-serif font-bold text-[#0F2D1F] mb-5">Federal identifiers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Employer Identification Number (EIN)</label>
            <input className="input font-mono" {...field('ein')} placeholder="12-3456789" />
          </div>
          <div>
            <label className="label">Unique Entity Identifier (UEI)</label>
            <input className="input font-mono" {...field('uei')} placeholder="12 characters" maxLength={12} />
            <p className="text-xs text-gray-400 mt-1">Find at <a href="https://sam.gov" target="_blank" className="text-[#3B6E50] underline">SAM.gov</a></p>
          </div>
        </div>
      </div>

      {/* SAM.gov */}
      <div className="card">
        <h2 className="font-serif font-bold text-[#0F2D1F] mb-5">SAM.gov status</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Registration status</label>
            <div className="flex gap-6">
              {[true, false].map(val => (
                <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={form.sam_gov_active === val}
                    onChange={() => setForm(p => ({ ...p, sam_gov_active: val }))} />
                  <span className="text-sm">{val ? '✓ Active' : '✗ Inactive / Not registered'}</span>
                </label>
              ))}
            </div>
          </div>
          {form.sam_gov_active && (
            <div className="max-w-xs">
              <label className="label">Expiration date</label>
              <input type="date" className="input" {...field('sam_gov_expiry')} />
            </div>
          )}
          {!form.sam_gov_active && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
              ⚠ SAM.gov registration is required for most federal grants. <a href="https://sam.gov" target="_blank" className="underline">Register at SAM.gov →</a>
            </div>
          )}
        </div>
      </div>

      {/* Federal spend */}
      <div className="card">
        <h2 className="font-serif font-bold text-[#0F2D1F] mb-5">Federal expenditure profile</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Federal expenditures last fiscal year</label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" className="input pl-7" {...field('federal_expenditures_last_fy')} />
            </div>
            <p className="text-xs text-gray-400 mt-1">$1,000,000+ triggers Single Audit requirement (31 U.S.C. § 7502)</p>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="sa" checked={form.single_audit_required}
              onChange={e => setForm(p => ({ ...p, single_audit_required: e.target.checked }))}
              className="w-4 h-4" />
            <label htmlFor="sa" className="text-sm text-gray-700">Currently required to obtain a Single Audit</label>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="card">
        <h2 className="font-serif font-bold text-[#0F2D1F] mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F2D1F]">{profile?.subscription_tier ? `${profile.subscription_tier.toUpperCase()} plan` : 'No active plan'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{profile?.subscription_status} · {profile?.subscription_interval}</p>
          </div>
          <a href={`https://billing.stripe.com/p/login`} target="_blank"
            className="btn-outline text-sm px-4 py-2">
            Manage billing →
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="btn-primary px-8 py-3">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        {saved && <span className="text-sm text-[#3B6E50] font-medium">✓ Saved</span>}
      </div>
    </div>
  )
}

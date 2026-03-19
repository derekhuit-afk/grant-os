import { createServerClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Link from 'next/link'
export const dynamic = 'force-dynamic'

const REGS = [
  { code: '2 CFR Part 200', label: 'OMB Uniform Guidance', description: 'Governs all federal grants — cost principles, procurement, reporting, audit requirements.' },
  { code: 'GEPA § 427', label: 'GEPA Section 427', description: 'Required equitable access plan for all Dept. of Education discretionary grant applications.' },
  { code: '31 U.S.C. § 7502', label: 'Single Audit Act', description: 'Organizations expending $1M+ in federal funds per year must obtain an independent Single Audit.' },
  { code: '2 CFR Part 180', label: 'Debarment & Suspension', description: 'SAM.gov exclusion checks required before awarding or passing through federal funds.' },
  { code: '20 U.S.C. § 1232g', label: 'FERPA', description: 'School district users must ensure student data is not included in grant applications.' },
]

export default async function CompliancePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: events }, { data: grants }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('compliance_events').select('*').eq('user_id', user!.id).order('due_date', { ascending: true }),
    supabase.from('grants').select('id, title, gepa_required, status, deadline').eq('user_id', user!.id),
  ])

  const federalSpend = profile?.federal_expenditures_last_fy || 0
  const samExpiry = profile?.sam_gov_expiry ? new Date(profile.sam_gov_expiry) : null
  const samExpiringSoon = samExpiry && (samExpiry.getTime() - Date.now()) < 60 * 24 * 60 * 60 * 1000

  const gepaGrants = grants?.filter(g => g.gepa_required && g.status === 'drafting') || []

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">Compliance Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Federal grant compliance tracking for your organization.</p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* SAM.gov status */}
          <div className={`card border-l-4 ${profile?.sam_gov_active ? (samExpiringSoon ? 'border-yellow-400' : 'border-[#3B6E50]') : 'border-red-400'}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">SAM.gov Registration</p>
            <div className={`text-sm font-bold ${profile?.sam_gov_active ? (samExpiringSoon ? 'text-yellow-700' : 'text-[#3B6E50]') : 'text-red-600'}`}>
              {profile?.sam_gov_active ? (samExpiringSoon ? '⚠ Expiring soon' : '✓ Active') : '✗ Inactive'}
            </div>
            {samExpiry && <p className="text-xs text-gray-400 mt-1">Expires {samExpiry.toLocaleDateString()}</p>}
            <a href="https://sam.gov" target="_blank" rel="noopener" className="text-xs text-[#3B6E50] underline mt-2 block">Manage at SAM.gov →</a>
          </div>

          {/* Single audit */}
          <div className={`card border-l-4 ${federalSpend >= 1000000 ? 'border-red-400' : federalSpend >= 750000 ? 'border-yellow-400' : 'border-[#3B6E50]'}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Single Audit Threshold</p>
            <div className={`text-sm font-bold ${federalSpend >= 1000000 ? 'text-red-600' : federalSpend >= 750000 ? 'text-yellow-700' : 'text-[#3B6E50]'}`}>
              {federalSpend >= 1000000 ? '⚠ Required' : federalSpend >= 750000 ? '⚠ Approaching' : '✓ Below threshold'}
            </div>
            <p className="text-xs text-gray-400 mt-1">${federalSpend.toLocaleString()} last FY</p>
            <p className="text-xs text-gray-400">Threshold: $1,000,000</p>
          </div>

          {/* GEPA grants */}
          <div className={`card border-l-4 ${gepaGrants.length > 0 ? 'border-blue-400' : 'border-[#3B6E50]'}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">GEPA § 427 Pending</p>
            <div className={`text-sm font-bold ${gepaGrants.length > 0 ? 'text-blue-700' : 'text-[#3B6E50]'}`}>
              {gepaGrants.length > 0 ? `${gepaGrants.length} grant${gepaGrants.length > 1 ? 's' : ''} need GEPA plan` : '✓ None pending'}
            </div>
            {gepaGrants.map(g => (
              <p key={g.id} className="text-xs text-gray-400 mt-1 truncate">{g.title}</p>
            ))}
          </div>
        </div>

        {/* Compliance events */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif font-bold text-[#0F2D1F]">Compliance calendar</h2>
          </div>
          {(!events || events.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No compliance events tracked yet.</p>
              <p className="text-gray-300 text-xs mt-1">Events are auto-generated based on your grant deadlines and award dates.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Event</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Due date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(ev => {
                  const daysLeft = Math.ceil((new Date(ev.due_date).getTime() - Date.now()) / 86400000)
                  return (
                    <tr key={ev.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-[#0F2D1F]">{ev.title}</p>
                        {ev.description && <p className="text-xs text-gray-400 mt-0.5">{ev.description}</p>}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className={`text-xs font-bold ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-700' : 'text-gray-500'}`}>
                          {new Date(ev.due_date).toLocaleDateString()}
                          {daysLeft >= 0 && ` (${daysLeft}d)`}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ev.status === 'complete' ? 'bg-green-100 text-green-700' : ev.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Regulatory reference */}
        <div className="card">
          <h2 className="font-serif font-bold text-[#0F2D1F] mb-4">Regulatory reference</h2>
          <div className="space-y-3">
            {REGS.map(reg => (
              <div key={reg.code} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                <span className="text-xs font-bold font-mono bg-[#EAF2EC] text-[#3B6E50] px-2 py-1 rounded flex-shrink-0 mt-0.5">{reg.code}</span>
                <div>
                  <p className="text-sm font-semibold text-[#0F2D1F]">{reg.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{reg.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Grant OS provides compliance monitoring as an informational tool only. This does not constitute legal advice, audit services, or regulatory compliance certification. Consult qualified legal and financial professionals for compliance determinations.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

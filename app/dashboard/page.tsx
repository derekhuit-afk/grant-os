import { createServerClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
export const dynamic = 'force-dynamic'

export default async function CommandCenterPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: grants }, { data: compliance }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('grants').select('*').eq('user_id', user!.id).order('deadline', { ascending: true }),
    supabase.from('compliance_events').select('*').eq('user_id', user!.id).eq('status', 'pending').order('due_date', { ascending: true }).limit(5),
  ])

  const active = grants?.filter(g => ['research', 'drafting', 'submitted'].includes(g.status)) || []
  const awarded = grants?.filter(g => g.status === 'awarded') || []
  const totalAwarded = awarded.reduce((sum, g) => sum + (g.award_amount || 0), 0)
  const upcomingDeadlines = grants?.filter(g => g.deadline && new Date(g.deadline) > new Date()).slice(0, 3) || []

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">{profile?.org_name || 'Your organization'} · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* SAM.gov alert */}
        {!profile?.sam_gov_active && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
            <span className="text-yellow-500 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-yellow-800">SAM.gov registration inactive</p>
              <p className="text-xs text-yellow-700 mt-0.5">Most federal grants require active SAM.gov registration. <a href="https://sam.gov" target="_blank" rel="noopener" className="underline">Register or renew at SAM.gov →</a></p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active grants', value: active.length, color: 'text-[#0F2D1F]' },
            { label: 'Submitted', value: grants?.filter(g => g.status === 'submitted').length || 0, color: 'text-blue-700' },
            { label: 'Awards won', value: awarded.length, color: 'text-[#3B6E50]' },
            { label: 'Total awarded', value: `$${totalAwarded.toLocaleString()}`, color: 'text-[#C8960C]' },
          ].map(stat => (
            <div key={stat.label} className="card">
              <div className={`text-2xl font-serif font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Upcoming deadlines */}
          <div className="card">
            <h2 className="text-base font-serif font-bold text-[#0F2D1F] mb-4">Upcoming deadlines</h2>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming deadlines. <a href="/discovery" className="text-[#3B6E50] underline">Find grants →</a></p>
            ) : (
              <ul className="space-y-3">
                {upcomingDeadlines.map(g => {
                  const daysLeft = Math.ceil((new Date(g.deadline!).getTime() - Date.now()) / 86400000)
                  return (
                    <li key={g.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#0F2D1F]">{g.title}</p>
                        <p className="text-xs text-gray-400">{g.funder}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${daysLeft <= 7 ? 'bg-red-100 text-red-700' : daysLeft <= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {daysLeft}d
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Compliance events */}
          <div className="card">
            <h2 className="text-base font-serif font-bold text-[#0F2D1F] mb-4">Compliance reminders</h2>
            {(!compliance || compliance.length === 0) ? (
              <p className="text-sm text-gray-400">No pending compliance events.</p>
            ) : (
              <ul className="space-y-3">
                {compliance.map(ev => (
                  <li key={ev.id} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full flex-shrink-0">Due {new Date(ev.due_date).toLocaleDateString()}</span>
                    <p className="text-sm text-[#0F2D1F]">{ev.title}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Single audit warning */}
            {profile?.single_audit_required && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-red-700 font-semibold">⚠ Single Audit required</p>
                <p className="text-xs text-gray-500 mt-0.5">Your federal expenditures exceed $1M. Engage an independent auditor and submit to FAC within 9 months of fiscal year-end.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI disclaimer */}
        <div className="mt-6 bg-[#FFF8E7] border border-yellow-300 rounded-xl px-5 py-4">
          <p className="text-xs text-yellow-800 leading-relaxed">
            <strong>AI Content Notice:</strong> All AI-generated narratives from the AI Narrative Builder are advisory only. You must review, verify, and complete the User Attestation before using any AI-generated content in a grant application. False statements submitted to federal agencies may violate 18 U.S.C. § 1001 and the False Claims Act.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

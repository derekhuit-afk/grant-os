import { createServerClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DiscoveryClient from './DiscoveryClient'

export default async function DiscoveryPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('org_type, ntee_code, state, ein').eq('id', user!.id).single()

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">Grant Discovery</h1>
          <p className="text-gray-500 text-sm mt-1">AI-matched federal and private funding opportunities based on your organization profile.</p>
        </div>
        <DiscoveryClient orgType={profile?.org_type} state={profile?.state} />
      </div>
    </DashboardLayout>
  )
}

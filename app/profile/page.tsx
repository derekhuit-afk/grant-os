import { createServerClient } from '@/lib/supabase'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OrgProfileClient from './OrgProfileClient'
export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">Organization Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Your federal identifiers, SAM.gov status, and billing information.</p>
        </div>
        <OrgProfileClient profile={profile} />
      </div>
    </DashboardLayout>
  )
}

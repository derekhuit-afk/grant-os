import { createServerClient } from '@/lib/supabase-server'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PipelineClient from './PipelineClient'
export const dynamic = 'force-dynamic'

export default async function PipelinePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: grants } = await supabase
    .from('grants')
    .select('*')
    .eq('user_id', user!.id)
    .order('updated_at', { ascending: false })

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">Grant Pipeline</h1>
            <p className="text-gray-500 text-sm mt-1">Track every grant from research to award.</p>
          </div>
        </div>
        <PipelineClient initialGrants={grants || []} />
      </div>
    </DashboardLayout>
  )
}

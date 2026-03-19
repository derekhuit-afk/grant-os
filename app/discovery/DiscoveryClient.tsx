'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

interface GrantResult {
  id: string
  title: string
  funder: string
  funder_type: string
  amount_min: number
  amount_max: number
  deadline: string
  program_type: string
  eligibility: string
  description: string
  cfda: string
  match_score: number
}

const FUNDER_TYPES = ['All', 'Federal', 'State', 'Foundation', 'Private']
const ORG_PROGRAM_TAGS: Record<string, string[]> = {
  nonprofit: ['Education', 'Health', 'Housing', 'Food Security', 'Youth', 'Arts', 'Environment', 'Community Development'],
  school_district: ['Title I', 'Title II', 'Title III', 'IDEA', 'ESSA', 'STEM', 'Mental Health', 'Technology'],
  government: ['Infrastructure', 'Public Safety', 'Economic Development', 'Housing', 'Environment', 'Health'],
}

export default function DiscoveryClient({ orgType, state }: { orgType?: string | null, state?: string | null }) {
  const supabase = createBrowserClient()
  const [query, setQuery] = useState('')
  const [funderFilter, setFunderFilter] = useState('All')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<GrantResult[]>([])
  const [searched, setSearched] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())

  const tags = ORG_PROGRAM_TAGS[orgType || 'nonprofit'] || ORG_PROGRAM_TAGS.nonprofit

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setSearched(false)

    try {
      const res = await fetch('/api/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrativeType: 'grant_discovery',
          prompt: `Search for grant opportunities. Query: "${query}". Org type: ${orgType || 'nonprofit'}. State: ${state || 'US'}. Funder filter: ${funderFilter}. Return a JSON array of 6 realistic grant opportunities with fields: id (uuid), title, funder, funder_type (federal/state/foundation/private), amount_min, amount_max, deadline (ISO date ~3-6 months out), program_type, eligibility, description (2 sentences), cfda (if federal), match_score (60-98). Return ONLY valid JSON array, no other text.`,
        }),
      })
      const data = await res.json()
      const parsed = JSON.parse(data.content)
      setResults(Array.isArray(parsed) ? parsed : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
      setSearched(true)
    }
  }

  async function addToPipeline(grant: GrantResult) {
    setAddingId(grant.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('grants').insert({
      user_id: user.id,
      title: grant.title,
      funder: grant.funder,
      funder_type: grant.funder_type as any,
      cfda_number: grant.cfda,
      amount: grant.amount_max,
      deadline: grant.deadline,
      status: 'research',
      program_type: grant.program_type,
    })

    setAdded(prev => new Set([...prev, grant.id]))
    setAddingId(null)
  }

  return (
    <div>
      {/* Search bar */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            className="input flex-1"
            placeholder={`Search grants for ${orgType === 'school_district' ? 'your district' : 'your organization'}... e.g. "after-school literacy programs Title I"`} />
          <select value={funderFilter} onChange={e => setFunderFilter(e.target.value)} className="input w-36">
            {FUNDER_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={search} disabled={searching || !query.trim()} className="btn-primary px-6 flex-shrink-0">
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Quick tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {tags.map(tag => (
            <button key={tag} onClick={() => { setQuery(tag); }}
              className="text-xs px-3 py-1 rounded-full border border-[#D4DDD7] text-gray-600 hover:border-[#3B6E50] hover:text-[#3B6E50] transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* FAC data note */}
      <div className="bg-[#EAF2EC] border border-[#D4DDD7] rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
        <span className="text-[#3B6E50] text-sm">🏛️</span>
        <p className="text-sm text-[#3B6E50]">
          <strong>Data sources:</strong> Nine Star 990 funder data · Federal Audit Clearinghouse (2017–2024) · Federal award databases. Funder intelligence loaded for your org type.
        </p>
      </div>

      {/* Results */}
      {searching && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#3B6E50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Searching federal databases and funder intelligence...</p>
          </div>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">No results found. Try a different search term.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{results.length} opportunities found</p>
          {results.map(grant => (
            <div key={grant.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EAF2EC] text-[#3B6E50]">{grant.funder_type}</span>
                    {grant.cfda && <span className="text-xs font-mono text-gray-400">CFDA {grant.cfda}</span>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${grant.match_score >= 85 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {grant.match_score}% match
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0F2D1F] mb-1">{grant.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">{grant.funder}</p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{grant.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                    <span>💰 ${grant.amount_min?.toLocaleString()} – ${grant.amount_max?.toLocaleString()}</span>
                    <span>📅 Deadline: {grant.deadline ? new Date(grant.deadline).toLocaleDateString() : 'Rolling'}</span>
                    <span>🏷️ {grant.program_type}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => addToPipeline(grant)}
                    disabled={addingId === grant.id || added.has(grant.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                      ${added.has(grant.id) ? 'bg-[#EAF2EC] text-[#3B6E50] cursor-default' : 'btn-primary'}`}>
                    {added.has(grant.id) ? '✓ Added' : addingId === grant.id ? 'Adding...' : 'Add to pipeline'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

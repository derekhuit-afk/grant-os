'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

type Grant = {
  id: string
  title: string
  funder: string
  amount: number | null
  deadline: string | null
  status: string
  program_type: string | null
  funder_type: string | null
  notes: string | null
  gepa_required: boolean
}

const COLUMNS = [
  { id: 'research',  label: 'Research',  color: 'bg-gray-100 text-gray-600' },
  { id: 'drafting',  label: 'Drafting',  color: 'bg-blue-50 text-blue-700' },
  { id: 'submitted', label: 'Submitted', color: 'bg-yellow-50 text-yellow-700' },
  { id: 'awarded',   label: 'Awarded',   color: 'bg-green-100 text-[#3B6E50]' },
  { id: 'rejected',  label: 'Rejected',  color: 'bg-red-50 text-red-600' },
]

export default function PipelineClient({ initialGrants }: { initialGrants: Grant[] }) {
  const supabase = createBrowserClient()
  const [grants, setGrants] = useState(initialGrants)
  const [showAdd, setShowAdd] = useState(false)
  const [newGrant, setNewGrant] = useState({ title: '', funder: '', amount: '', deadline: '', funder_type: 'federal', program_type: '', gepa_required: false })
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  async function moveGrant(id: string, newStatus: string) {
    setGrants(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g))
    await supabase.from('grants').update({ status: newStatus }).eq('id', id)
  }

  async function addGrant() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('grants').insert({
      user_id: user.id,
      title: newGrant.title,
      funder: newGrant.funder,
      amount: newGrant.amount ? parseFloat(newGrant.amount) : null,
      deadline: newGrant.deadline || null,
      funder_type: newGrant.funder_type as any,
      program_type: newGrant.program_type || null,
      gepa_required: newGrant.gepa_required,
      status: 'research',
    }).select().single()

    if (data) {
      setGrants(prev => [data as Grant, ...prev])
      setNewGrant({ title: '', funder: '', amount: '', deadline: '', funder_type: 'federal', program_type: '', gepa_required: false })
      setShowAdd(false)
    }
    setSaving(false)
  }

  async function deleteGrant(id: string) {
    if (!confirm('Remove this grant from your pipeline?')) return
    setGrants(prev => prev.filter(g => g.id !== id))
    await supabase.from('grants').delete().eq('id', id)
  }

  function handleDragStart(id: string) { setDragId(id) }
  function handleDrop(status: string) {
    if (dragId) { moveGrant(dragId, status); setDragId(null) }
  }

  return (
    <div>
      {/* Add grant button */}
      <div className="mb-6">
        {!showAdd ? (
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add grant</button>
        ) : (
          <div className="card max-w-2xl">
            <h3 className="font-semibold text-[#0F2D1F] mb-4">Add grant to pipeline</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="label">Grant title *</label>
                <input value={newGrant.title} onChange={e => setNewGrant(p => ({ ...p, title: e.target.value }))} className="input" placeholder="Title I Part A — Improving Basic Programs" />
              </div>
              <div>
                <label className="label">Funder *</label>
                <input value={newGrant.funder} onChange={e => setNewGrant(p => ({ ...p, funder: e.target.value }))} className="input" placeholder="U.S. Dept. of Education" />
              </div>
              <div>
                <label className="label">Funder type</label>
                <select value={newGrant.funder_type} onChange={e => setNewGrant(p => ({ ...p, funder_type: e.target.value }))} className="input">
                  <option value="federal">Federal</option>
                  <option value="state">State</option>
                  <option value="foundation">Foundation</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div>
                <label className="label">Award amount</label>
                <input type="number" value={newGrant.amount} onChange={e => setNewGrant(p => ({ ...p, amount: e.target.value }))} className="input" placeholder="250000" />
              </div>
              <div>
                <label className="label">Deadline</label>
                <input type="date" value={newGrant.deadline} onChange={e => setNewGrant(p => ({ ...p, deadline: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Program type</label>
                <input value={newGrant.program_type} onChange={e => setNewGrant(p => ({ ...p, program_type: e.target.value }))} className="input" placeholder="After-school literacy" />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="gepa" checked={newGrant.gepa_required} onChange={e => setNewGrant(p => ({ ...p, gepa_required: e.target.checked }))} className="w-4 h-4" />
                <label htmlFor="gepa" className="text-sm text-gray-700">GEPA § 427 required (Dept. of Education grants)</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn-outline px-5">Cancel</button>
              <button onClick={addGrant} disabled={!newGrant.title || !newGrant.funder || saving} className="btn-primary px-6">
                {saving ? 'Adding...' : 'Add to pipeline'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-5 gap-4 min-h-96">
        {COLUMNS.map(col => {
          const colGrants = grants.filter(g => g.status === col.id)
          return (
            <div key={col.id}
              className="flex flex-col"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}>
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-3 ${col.color}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{col.label}</span>
                <span className="text-xs font-bold">{colGrants.length}</span>
              </div>

              <div className="flex-1 space-y-3 min-h-20">
                {colGrants.map(grant => {
                  const daysLeft = grant.deadline ? Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / 86400000) : null
                  return (
                    <div key={grant.id}
                      draggable
                      onDragStart={() => handleDragStart(grant.id)}
                      className="bg-white border border-[#D4DDD7] rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                      <p className="text-xs font-bold text-[#3B6E50] uppercase tracking-wider mb-1">{grant.funder_type}</p>
                      <h4 className="text-sm font-semibold text-[#0F2D1F] leading-tight mb-1">{grant.title}</h4>
                      <p className="text-xs text-gray-400 mb-2">{grant.funder}</p>

                      <div className="flex items-center justify-between flex-wrap gap-1">
                        {grant.amount && <span className="text-xs text-gray-500">${Number(grant.amount).toLocaleString()}</span>}
                        {daysLeft !== null && (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${daysLeft < 0 ? 'bg-red-100 text-red-700' : daysLeft <= 14 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            {daysLeft < 0 ? 'Overdue' : `${daysLeft}d`}
                          </span>
                        )}
                      </div>

                      {grant.gepa_required && (
                        <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">GEPA § 427</span>
                      )}

                      {/* Move controls */}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUMNS.filter(c => c.id !== col.id).map(c => (
                          <button key={c.id} onClick={() => moveGrant(grant.id, c.id)}
                            className="text-xs text-gray-400 hover:text-[#3B6E50] transition-colors">
                            → {c.label}
                          </button>
                        ))}
                        <button onClick={() => deleteGrant(grant.id)} className="text-xs text-red-300 hover:text-red-500 ml-auto transition-colors">✕</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

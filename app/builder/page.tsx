'use client'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AttestationModal from '@/components/ui/AttestationModal'

const NARRATIVE_TYPES = [
  { value: 'needs_statement', label: 'Needs Statement' },
  { value: 'project_description', label: 'Project Description' },
  { value: 'goals_objectives', label: 'Goals & Objectives' },
  { value: 'evaluation_plan', label: 'Evaluation Plan' },
  { value: 'gepa_427', label: 'GEPA Section 427 Plan' },
  { value: 'budget_justification', label: 'Budget Justification' },
]

export default function BuilderPage() {
  const [narrativeType, setNarrativeType] = useState('needs_statement')
  const [prompt, setPrompt] = useState('')
  const [generated, setGenerated] = useState('')
  const [narrativeId, setNarrativeId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [showAttestation, setShowAttestation] = useState(false)
  const [attested, setAttested] = useState(false)

  async function generate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setError('')
    setGenerated('')
    setAttested(false)

    try {
      const res = await fetch('/api/ai/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrativeType, prompt }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setGenerated(data.content)
      setNarrativeId(data.narrativeId)
    } catch (e) {
      setError('Failed to generate narrative. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function handleAttestationComplete() {
    setAttested(true)
    setShowAttestation(false)
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#0F2D1F]">AI Narrative Builder</h1>
          <p className="text-gray-500 text-sm mt-1">Draft grant narratives with AI assistance. Mandatory attestation required before use.</p>
        </div>

        {/* Warning banner */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <span className="text-yellow-500 text-lg flex-shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-yellow-800">Review before use — required</p>
            <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
              AI-generated narratives may contain factual errors. You must verify all statistics, program descriptions, and outcome statements against your organization's actual records before including them in any grant application. Complete the attestation to confirm your review.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-[#0F2D1F]">Build your narrative</h2>

            <div>
              <label className="label">Narrative type</label>
              <select value={narrativeType} onChange={e => setNarrativeType(e.target.value)} className="input">
                {NARRATIVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {narrativeType === 'gepa_427' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800 leading-relaxed">
                <strong>GEPA § 427 note:</strong> AI-generated equity plans are a starting point only. You must substantially customize the output to reflect your specific program, populations served, and organizational equity strategy before submission to the Department of Education.
              </div>
            )}

            <div>
              <label className="label">Describe your program and context</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={8} className="input resize-none"
                placeholder={`Example for needs statement:\n\nOur organization serves 500 low-income youth in rural Alaska. We are applying for the Title I Part A grant. Our community has a 45% poverty rate and our school district scores below state average in 3rd grade reading. Describe the need for our after-school literacy program.`} />
              <p className="text-xs text-gray-400 mt-1">The more detail you provide, the more accurate the output. Always verify all generated content.</p>
            </div>

            <button onClick={generate} disabled={generating || !prompt.trim()} className="btn-primary w-full py-3">
              {generating ? 'Generating...' : 'Generate narrative →'}
            </button>
          </div>

          {/* Output panel */}
          <div className="card flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0F2D1F]">Generated content</h2>
              {attested && <span className="badge-active">✓ Attested</span>}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            {!generated && !generating && (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">
                Generated narrative will appear here
              </div>
            )}

            {generating && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#3B6E50] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Generating your narrative...</p>
                </div>
              </div>
            )}

            {generated && (
              <>
                <div className="flex-1 bg-cream rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-96">
                  {generated}
                </div>

                <div className="mt-4 space-y-3">
                  {!attested ? (
                    <button onClick={() => setShowAttestation(true)} className="btn-primary w-full py-3">
                      Review &amp; complete attestation →
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button onClick={() => navigator.clipboard.writeText(generated)} className="btn-outline w-full py-2.5 text-sm">
                        Copy to clipboard
                      </button>
                      <p className="text-xs text-center text-gray-400">Attestation logged · {new Date().toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    Verify all facts, statistics, and descriptions against your organization's actual records before use.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAttestation && narrativeId && (
        <AttestationModal
          contentType={NARRATIVE_TYPES.find(t => t.value === narrativeType)?.label || narrativeType}
          narrativeId={narrativeId}
          onComplete={handleAttestationComplete}
          onClose={() => setShowAttestation(false)}
        />
      )}
    </DashboardLayout>
  )
}

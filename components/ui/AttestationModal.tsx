'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase'

const ATTESTATION_ITEMS = [
  { id: 'read', text: 'I have read and reviewed this AI-generated content in its entirety.' },
  { id: 'facts', text: 'I have verified the factual accuracy of all statistics, data points, and outcome statements against my organization\'s actual records.' },
  { id: 'org', text: 'All descriptions of programs, staff qualifications, and populations served accurately reflect my organization\'s current operations.' },
  { id: 'nofo', text: 'I have reviewed the applicable NOFO or RFP and confirmed this content meets program-specific requirements.' },
  { id: 'legal', text: 'I understand that submitting false or misleading statements to a federal agency may violate 18 U.S.C. § 1001, the False Claims Act, and other federal law — regardless of whether AI generated the content.' },
  { id: 'responsibility', text: 'I accept sole legal responsibility for all grant applications submitted by my organization. Huit.AI, LLC and Grant OS bear no liability for submitted application content.' },
]

interface Props {
  contentType: string
  narrativeId: string
  onComplete: () => void
  onClose: () => void
}

export default function AttestationModal({ contentType, narrativeId, onComplete, onClose }: Props) {
  const supabase = createBrowserClient()
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const allChecked = ATTESTATION_ITEMS.every(item => checked[item.id])

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleSubmit() {
    if (!allChecked) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/attestation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          narrativeId,
          itemsConfirmed: ATTESTATION_ITEMS.map(i => i.text),
        }),
      })
      if (!res.ok) throw new Error('Failed to log attestation')
      onComplete()
    } catch {
      setError('Failed to save attestation. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,25,15,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm font-semibold text-yellow-800">⚠️ Required before use</p>
            <p className="text-xs text-yellow-700 mt-1 leading-relaxed">
              Federal law holds grant applicants legally responsible for all submitted content. This attestation is timestamped and logged for compliance recordkeeping.
            </p>
          </div>

          <h2 className="text-xl font-serif font-bold text-[#0F2D1F] mb-1">User Attestation</h2>
          <p className="text-sm text-gray-500 mb-6">
            Content type: <strong className="text-[#0F2D1F]">{contentType}</strong>
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}

          {/* Checklist */}
          <ul className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            {ATTESTATION_ITEMS.map((item, i) => (
              <li key={item.id}
                onClick={() => toggle(item.id)}
                className={`flex items-start gap-3 px-5 py-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors select-none
                  ${checked[item.id] ? 'bg-[#EAF2EC]' : 'hover:bg-gray-50'}`}>
                <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all
                  ${checked[item.id] ? 'bg-[#3B6E50] border-[#3B6E50]' : 'border-gray-300 bg-white'}`}>
                  {checked[item.id] && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-5 py-3 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!allChecked || submitting}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all
                ${allChecked && !submitting
                  ? 'bg-[#0F2D1F] text-white hover:bg-[#1A4731]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {submitting ? 'Logging attestation...' : `Confirm attestation (${Object.values(checked).filter(Boolean).length}/${ATTESTATION_ITEMS.length})`}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Attestation will be timestamped and logged to your compliance record upon confirmation.
          </p>
        </div>
      </div>
    </div>
  )
}

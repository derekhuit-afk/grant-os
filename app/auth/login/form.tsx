'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') || '/dashboard'
  const supabase = createBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0F2D1F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-[#C8960C] rounded-md flex items-center justify-center text-[#0F2D1F] font-bold text-sm">G</div>
            <span className="font-serif text-xl text-white font-bold">Grant OS</span>
          </div>
          <h1 className="text-2xl text-white font-serif font-bold">Sign in to your account</h1>
          <p className="text-white/60 text-sm mt-2">Federal grant intelligence platform</p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@organization.org" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">No account? <Link href="/auth/signup" className="text-[#3B6E50] font-semibold hover:underline">Request access →</Link></p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-8 max-w-sm mx-auto leading-relaxed">
          Paid subscription required. <Link href="/terms" className="underline">Terms of Service</Link>
        </p>
      </div>
    </div>
  )
}

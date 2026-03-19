'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase'

const NAV = [
  { href: '/dashboard', label: 'Command Center', icon: '⬡' },
  { href: '/discovery', label: 'Grant Discovery', icon: '🔍' },
  { href: '/builder', label: 'AI Narrative Builder', icon: '✍️' },
  { href: '/pipeline', label: 'Pipeline', icon: '📋' },
  { href: '/compliance', label: 'Compliance Monitor', icon: '⚖️' },
  { href: '/profile', label: 'Org Profile', icon: '🏛️' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0F2D1F] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#C8960C] rounded flex items-center justify-center text-[#0F2D1F] font-bold text-xs">G</div>
            <span className="font-serif text-white font-bold">Grant OS</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${pathname === item.href
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/privacy" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors">Terms of Service</Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors text-left">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup', 
  '/billing',
  '/privacy',
  '/terms',
  '/api/stripe/webhook',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // Allow public routes through immediately
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return res

  // Gracefully skip auth if Supabase env vars not configured yet
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')) {
    // Env vars not set — redirect everything to login with a setup notice
    if (pathname !== '/auth/login') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    return res
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    })

    const { data: { session } } = await supabase.auth.getSession()

    // Not authenticated → login
    if (!session) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check onboarding + subscription for dashboard routes
    const isDashboard = ['/dashboard', '/discovery', '/builder', '/pipeline', '/compliance', '/profile'].some(r => pathname.startsWith(r))
    if (isDashboard) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete, subscription_status')
        .eq('id', session.user.id)
        .single()

      if (profile && !profile.onboarding_complete && pathname !== '/onboarding') {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
      if (profile && profile.subscription_status !== 'active' && pathname !== '/billing') {
        return NextResponse.redirect(new URL('/billing', req.url))
      }
    }
  } catch (e) {
    // Middleware error — fail open to login rather than 500
    console.error('Middleware error:', e)
    if (pathname !== '/auth/login') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}

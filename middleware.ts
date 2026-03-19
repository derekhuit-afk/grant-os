import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/auth/login', '/auth/signup', '/privacy', '/terms',
  '/api/stripe/webhook',
]

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  // Public routes — pass through
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return supabaseResponse
  }

  // No session → login
  if (!user) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Dashboard routes — check onboarding + subscription
  const isDashboard = ['/dashboard','/discovery','/builder','/pipeline','/compliance','/profile']
    .some(r => pathname.startsWith(r))

  if (isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, subscription_status')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarding_complete && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }

    if (profile && profile.subscription_status !== 'active' && pathname !== '/billing') {
      return NextResponse.redirect(new URL('/billing', req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}

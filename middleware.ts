import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/privacy',
  '/terms',
  '/api/stripe/webhook',
]

const ONBOARDING_ROUTE = '/onboarding'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  // Allow public routes through
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return res

  // No session → redirect to login
  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check subscription status for dashboard routes
  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/discovery') ||
      pathname.startsWith('/builder') ||
      pathname.startsWith('/pipeline') ||
      pathname.startsWith('/compliance') ||
      pathname.startsWith('/profile')) {

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, subscription_status')
      .eq('id', session.user.id)
      .single()

    // Redirect to onboarding if not complete
    if (profile && !profile.onboarding_complete && pathname !== ONBOARDING_ROUTE) {
      return NextResponse.redirect(new URL(ONBOARDING_ROUTE, req.url))
    }

    // Redirect to billing if subscription inactive
    if (profile && profile.subscription_status !== 'active' && pathname !== '/billing') {
      return NextResponse.redirect(new URL('/billing', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}

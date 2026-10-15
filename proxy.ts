// Next.js 16 renamed `middleware.ts` to `proxy.ts`. It protects every page and API route
// with the single HQ_PASSWORD. On Vercel the /eve/v1/* routes go straight to the eve
// service and never reach this file: they are protected by agent/channels/eve.ts.
import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, isValidSessionToken } from '@/lib/hq-auth'

const PUBLIC_PATHS = new Set(['/login', '/api/login', '/eve/v1/health'])

// Daily wake-up (protected by its own token + CRON_SECRET) and eve's internal callbacks.
const PUBLIC_PREFIXES = ['/eve/v1/cron/', '/eve/v1/callback/', '/eve/v1/task-input/']
const CONNECTION_CALLBACK = /^\/eve\/v1\/connections\/[^/]+\/callback\//

function isPublic(pathname: string): boolean {
  return (
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    CONNECTION_CALLBACK.test(pathname)
  )
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  if (await isValidSessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/') || pathname.startsWith('/eve/')) {
    return NextResponse.json(
      { ok: false, code: 'unauthorized', error: 'Password richiesta.' },
      { status: 401, headers: { 'cache-control': 'no-store' } },
    )
  }

  const loginUrl = new URL('/login', request.url)
  if (pathname !== '/') loginUrl.searchParams.set('next', pathname + search)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // Skip static files: Next.js assets, Vercel analytics, favicon and images.
  matcher: [
    '/((?!_next/static|_next/image|_vercel|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif)$).*)',
  ],
}

import { NextResponse, type NextRequest } from 'next/server'
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  isCorrectPassword,
} from '@/lib/hq-auth'

// Only same-site relative paths, so the login can't redirect elsewhere.
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const password = form.get('password')
  const next = safeNext(form.get('next'))

  const token = await createSessionToken()
  if (!token || typeof password !== 'string' || !(await isCorrectPassword(password))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', '1')
    if (next !== '/') loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl, 303)
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303)
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

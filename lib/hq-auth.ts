// Single-password gate shared by proxy.ts, the login route and the eve channel.
// Uses only Web Crypto (crypto.subtle) so it runs in any runtime.

export const SESSION_COOKIE = 'hq_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days, in seconds

const SESSION_MESSAGE = 'headquarter-session-v1'

async function hmac(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function configuredPassword(): string | null {
  const password = process.env.HQ_PASSWORD
  return password && password.length > 0 ? password : null
}

/** Cookie value for the configured password: HMAC(HQ_PASSWORD, fixed message). Never the password itself. */
export async function createSessionToken(): Promise<string | null> {
  const password = configuredPassword()
  return password ? hmac(password, SESSION_MESSAGE) : null
}

/** Compares a submitted password with HQ_PASSWORD without leaking timing. */
export async function isCorrectPassword(submitted: string): Promise<boolean> {
  const password = configuredPassword()
  if (!password) return false
  const [expected, actual] = await Promise.all([
    hmac(password, SESSION_MESSAGE),
    hmac(submitted, SESSION_MESSAGE),
  ])
  return safeEqual(expected, actual)
}

export async function isValidSessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false
  const expected = await createSessionToken()
  return expected !== null && safeEqual(expected, token)
}

/** Reads the session cookie from a raw Cookie header (used where no cookie helper exists). */
export function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='))
  }
  return null
}

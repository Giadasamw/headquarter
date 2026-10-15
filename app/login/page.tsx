import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Accedi · Assistente di Giada',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>
}) {
  const { error, next } = await searchParams

  return (
    <main className="mx-auto flex h-dvh w-full max-w-sm flex-col justify-center px-4">
      <header className="mb-6">
        <h1 className="text-base font-medium">Assistente di Giada</h1>
        <p className="text-sm text-muted-foreground">Inserisci la password per entrare.</p>
      </header>

      <form method="post" action="/api/login" className="flex flex-col gap-3">
        <input type="hidden" name="next" value={next ?? '/'} />
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'password-error' : undefined}
          className="h-10 rounded-2xl border border-border bg-background px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />
        {error && (
          <p id="password-error" role="alert" className="text-sm text-destructive">
            Password non corretta. Riprova.
          </p>
        )}
        <Button type="submit" size="lg" className="h-10 rounded-2xl">
          Entra
        </Button>
      </form>
    </main>
  )
}

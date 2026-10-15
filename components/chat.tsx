'use client'

import { Fragment, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useEveAgent } from 'eve/react'
import { ArrowUp } from 'lucide-react'
import { ApprovalCard } from '@/components/approval-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Chat({ briefing }: { briefing?: ReactNode }) {
  const agent = useEveAgent()
  const [input, setInput] = useState('')
  const isBusy = agent.status === 'submitted' || agent.status === 'streaming'
  const isResuming = agent.status === 'resuming'
  const messages = agent.data.messages

  function submit() {
    const text = input.trim()
    if (!text || isResuming) return
    void agent.send(text, isBusy ? { turnPolicy: 'steer' } : undefined)
    setInput('')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col px-4">
      <header className="border-b border-border py-5">
        <h1 className="text-base font-medium">Assistente di Giada</h1>
        <p className="text-sm text-muted-foreground">Agente eve · prova</p>
        {briefing}
      </header>

      <section
        aria-live="polite"
        className="flex flex-1 flex-col gap-4 overflow-y-auto py-6"
      >
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted-foreground text-balance">
            {'Scrivi "Dammi il briefing" per iniziare.'}
          </p>
        ) : (
          messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === 'text' ? part.text : ''))
              .join('')
            const approvals = message.parts.filter(
              (part) =>
                part.type === 'dynamic-tool' &&
                (part.state === 'approval-requested' || part.state === 'output-denied'),
            )
            if (!text && approvals.length === 0) return null
            const isUser = message.role === 'user'
            return (
              <Fragment key={message.id}>
                {text && (
              <article
                key={message.id}
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  isUser
                    ? 'self-end bg-primary text-primary-foreground'
                    : 'self-start bg-muted text-foreground',
                )}
              >
                <span className="sr-only">{isUser ? 'Tu: ' : 'Assistente: '}</span>
                {text}
              </article>
                )}
                {approvals.map((part) =>
                  part.type === 'dynamic-tool' ? (
                    <ApprovalCard
                      key={part.toolCallId}
                      part={part}
                      onRespond={(requestId, optionId) => agent.respond([{ requestId, optionId }])}
                    />
                  ) : null,
                )}
              </Fragment>
            )
          })
        )}
        {agent.status === 'submitted' && (
          <p className="self-start text-sm text-muted-foreground">Sto pensando…</p>
        )}
        {agent.error && (
          <p role="alert" className="self-start text-sm text-destructive">
            Qualcosa non ha funzionato. Riprova.
          </p>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex items-end gap-2 rounded-2xl border border-border bg-background p-2"
      >
        <label htmlFor="message" className="sr-only">
          Messaggio
        </label>
        <textarea
          id="message"
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isResuming}
          placeholder="Scrivi un messaggio…"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isResuming}
          aria-label="Invia"
        >
          <ArrowUp aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}

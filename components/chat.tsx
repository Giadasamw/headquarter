'use client'

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useEveAgent } from 'eve/react'
import { ArrowUp } from 'lucide-react'
import { ApprovalCard } from '@/components/approval-card'
import { TestoFormattato } from '@/components/testo-formattato'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import styles from './sophie.module.css'

export function Chat({ briefing }: { briefing?: ReactNode }) {
  const agent = useEveAgent()
  const [input, setInput] = useState('')
  const isBusy = agent.status === 'submitted' || agent.status === 'streaming'
  const isResuming = agent.status === 'resuming'
  const messages = agent.data.messages
  const bottom = useRef<HTMLDivElement>(null)

  // "Sophie sta scrivendo…" stays until the first words of her reply arrive.
  const last = messages[messages.length - 1]
  const replyStarted =
    last?.role === 'assistant' && last.parts.some((part) => part.type === 'text' && part.text.trim() !== '')
  const isTyping = agent.status === 'submitted' || (agent.status === 'streaming' && !replyStarted)

  // Keep the newest message in view.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [messages, isTyping])

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
    <div className="flex min-h-0 w-full flex-1 flex-col px-6">
      <section
        aria-live="polite"
        className="flex flex-1 flex-col gap-4 overflow-y-auto pt-2 pb-6"
      >
        {briefing}

        {messages.length === 0 ? (
          <p className="m-auto text-center text-muted-foreground text-balance">
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
                  'max-w-[85%] rounded-(--raggio-md) px-4 py-2.5',
                  isUser
                    ? 'self-end whitespace-pre-wrap bg-primary text-primary-foreground'
                    : 'self-start border border-border text-foreground',
                )}
              >
                <span className="sr-only">{isUser ? 'Tu: ' : 'Sophie: '}</span>
                {isUser ? text : <TestoFormattato testo={text} />}
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
        {isTyping && (
          <p className="self-start rounded-(--raggio-md) border border-border px-4 py-2.5 text-muted-foreground">
            Sophie sta scrivendo…
            <span aria-hidden className={styles.puntini}>
              <span />
              <span />
              <span />
            </span>
          </p>
        )}
        {agent.error && (
          <p role="alert" className="self-start text-destructive">
            Qualcosa non ha funzionato. Riprova.
          </p>
        )}
        <div ref={bottom} />
      </section>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex items-end gap-2 rounded-(--raggio-lg) border border-border bg-background p-2"
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
          placeholder="Scrivi a Sophie…"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={!input.trim() || isResuming}
          aria-label="Invia"
          className="rounded-full"
        >
          <ArrowUp aria-hidden="true" />
        </Button>
      </form>
    </div>
  )
}

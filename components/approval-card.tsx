'use client'

import { useEffect, useState } from 'react'
import type { EveDynamicToolPart } from 'eve/react'
import { describeApproval } from '@/components/approval-text'
import { Button } from '@/components/ui/button'

const FALLBACK_OPTIONS = [
  { id: 'approve', label: 'Sì, procedi', style: 'primary' as const },
  { id: 'cancel', label: 'Annulla', style: 'default' as const },
]

// eve sends its own buttons in English: show them in Italian.
const OPTION_LABELS: Record<string, string> = { approve: 'Sì, procedi', cancel: 'Annulla', deny: 'Annulla' }

type Props = {
  part: EveDynamicToolPart
  onRespond: (requestId: string, optionId: string) => Promise<void>
}

export function ApprovalCard({ part, onRespond }: Props) {
  const [sending, setSending] = useState(false)
  // undefined while loading, null when the call can't be described in a sentence.
  const [sentence, setSentence] = useState<string | null | undefined>(undefined)
  const request = part.toolMetadata?.eve?.inputRequest
  const requestId = request?.requestId ?? part.approval?.id
  const options = request?.options?.length ? request.options : FALLBACK_OPTIONS
  const label = part.toolMetadata?.eve?.label ?? part.toolName

  // A string key, so a re-render with an equal input doesn't ask the server again.
  const inputKey = JSON.stringify(part.input ?? null)

  useEffect(() => {
    let current = true
    describeApproval(part.toolName, JSON.parse(inputKey))
      .catch(() => null)
      .then((text) => {
        if (current) setSentence(text)
      })
    return () => {
      current = false
    }
  }, [part.toolName, inputKey])

  const description = sentence ?? `Posso eseguire: ${label}?`

  if (part.state === 'output-denied') {
    return <p className="self-start text-[13px] text-muted-foreground">{`Annullato: ${sentence ?? label}`}</p>
  }
  if (part.state !== 'approval-requested' || !requestId) return null

  async function choose(optionId: string) {
    if (!requestId) return
    setSending(true)
    try {
      await onRespond(requestId, optionId)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      role="group"
      aria-label="Richiesta di conferma"
      className="self-start flex max-w-[85%] flex-col gap-4 rounded-(--raggio-lg) border border-border bg-background px-6 py-4"
    >
      <p className="font-medium">{sentence === undefined ? 'Preparo la richiesta…' : description}</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            size="lg"
            className="rounded-full px-4"
            variant={option.style === 'primary' ? 'default' : option.style === 'danger' ? 'destructive' : 'outline'}
            disabled={sending || sentence === undefined}
            onClick={() => choose(option.id)}
          >
            {OPTION_LABELS[option.id] ?? option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

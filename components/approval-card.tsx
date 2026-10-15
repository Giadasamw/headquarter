'use client'

import { useState } from 'react'
import type { EveDynamicToolPart } from 'eve/react'
import { Button } from '@/components/ui/button'

const FALLBACK_OPTIONS = [
  { id: 'approve', label: 'Approva', style: 'primary' as const },
  { id: 'deny', label: 'Annulla', style: 'default' as const },
]

type Props = {
  part: EveDynamicToolPart
  onRespond: (requestId: string, optionId: string) => Promise<void>
}

export function ApprovalCard({ part, onRespond }: Props) {
  const [sending, setSending] = useState(false)
  const request = part.toolMetadata?.eve?.inputRequest
  const requestId = request?.requestId ?? part.approval?.id
  const options = request?.options?.length ? request.options : FALLBACK_OPTIONS
  const label = part.toolMetadata?.eve?.label ?? part.toolName

  if (part.state === 'output-denied') {
    return <p className="self-start text-xs text-muted-foreground">{`Annullato: ${label}`}</p>
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
      aria-label="Richiesta di approvazione"
      className="self-start flex max-w-[85%] flex-col gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm"
    >
      <p className="font-medium">{request?.prompt ?? `Posso eseguire: ${label}?`}</p>
      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
        {JSON.stringify(part.input, null, 2)}
      </pre>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            size="sm"
            variant={option.style === 'primary' ? 'default' : option.style === 'danger' ? 'destructive' : 'outline'}
            disabled={sending}
            onClick={() => choose(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

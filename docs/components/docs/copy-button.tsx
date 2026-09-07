'use client'

import { RiCheckLine, RiFileCopyLine } from '@remixicon/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export const CopyButton = ({
  className,
  label = 'Copy',
  text,
}: {
  className?: string
  label?: string
  text: string
}) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // The browser blocked the clipboard; a 60px button has nothing to say.
    }
  }

  return (
    <Button
      aria-label={label}
      className={className}
      size="icon-xs"
      variant="ghost"
      onClick={() => {
        // oxlint-disable-next-line typescript/no-floating-promises -- copy handles its own failure
        copy()
      }}
    >
      {copied ? <RiCheckLine /> : <RiFileCopyLine />}
    </Button>
  )
}

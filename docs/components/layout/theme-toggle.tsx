'use client'

import { RiMoonLine, RiSunLine } from '@remixicon/react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      aria-label="Toggle theme"
      size="icon-sm"
      variant="ghost"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {/* Both glyphs: the server cannot know the scheme, and gating on a
          mount effect would paint an empty button first. */}
      <RiMoonLine className="dark:hidden" />
      <RiSunLine className="hidden dark:block" />
    </Button>
  )
}

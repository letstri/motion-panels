import { RiGithubFill } from '@remixicon/react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { SHELL } from './shell'
import { ThemeToggle } from './theme-toggle'

const REPO = 'https://github.com/letstri/motion-panels'

const NPM = 'https://www.npmjs.com/package/motion-panels'

const LINK =
  'kicker text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 no-underline outline-none transition-colors focus-visible:ring-2'

export const SiteHeader = () => (
  <header className="bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
    <div className={`${SHELL} flex h-14 items-center gap-8`}>
      <Link
        className="text-foreground flex items-center gap-2.5 text-[15px] font-medium tracking-[-0.01em] no-underline"
        href="/"
      >
        <svg aria-hidden fill="none" height="14" viewBox="0 0 20 14" width="20">
          <rect fill="currentColor" height="14" width="4" x="0" />
          <rect fill="currentColor" height="14" opacity="0.5" width="4" x="6" />
          <rect
            fill="currentColor"
            height="14"
            opacity="0.25"
            width="7"
            x="13"
          />
        </svg>
        motion-panels
      </Link>

      <nav className="ml-auto hidden items-center gap-7 min-[720px]:flex">
        <a className={LINK} href="#install">
          Docs
        </a>
        <a className={LINK} href="#api">
          API
        </a>
        <a className={LINK} href={NPM} rel="noreferrer" target="_blank">
          npm
        </a>
      </nav>

      <div className="ml-auto flex items-center gap-1 min-[720px]:ml-0">
        <ThemeToggle />
        <Button
          aria-label="GitHub"
          nativeButton={false}
          render={
            <a href={REPO} rel="noreferrer" target="_blank">
              <RiGithubFill />
            </a>
          }
          size="icon-sm"
          variant="ghost"
        />
      </div>
    </div>
  </header>
)

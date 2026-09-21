import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono, Merriweather } from 'next/font/google'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

import '@shikijs/twoslash/style-rich.css'
import './globals.css'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })

const heading = Merriweather({ subsets: ['latin'], variable: '--font-heading' })

const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  description:
    'Resizable panels animated with Motion. A framework-agnostic core with a React adapter on top.',
  title: 'motion-panels',
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html
    lang="en"
    suppressHydrationWarning
    className={`${sans.variable} ${heading.variable} ${mono.variable}`}
  >
    <body className="text-[15px]/[1.65] antialiased">
      <ThemeProvider attribute="class" disableTransitionOnChange enableSystem>
        <a
          className="bg-background focus:ring-ring/50 sr-only px-4 py-2 no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:ring-2"
          href="#content"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </ThemeProvider>
      <Analytics />
    </body>
  </html>
)

export default RootLayout

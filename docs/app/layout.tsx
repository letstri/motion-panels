import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Merriweather } from 'next/font/google'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ThemeProvider } from '@/components/theme-provider'

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
      <ThemeProvider>
        <SiteHeader />
        {children}
        <SiteFooter />
      </ThemeProvider>
      <Analytics />
    </body>
  </html>
)

export default RootLayout

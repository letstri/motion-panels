import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@shikijs/twoslash/style-rich.css'
import './globals.css'

export const metadata: Metadata = {
  description: 'Interactive docs for glidepanels.',
  title: 'glidepanels',
}

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
)

export default RootLayout

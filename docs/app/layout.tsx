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
    <body className="bg-bg text-text font-sans text-[15px]/[1.65] antialiased">
      {children}
    </body>
  </html>
)

export default RootLayout

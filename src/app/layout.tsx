import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import PlausibleProvider from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MLB Higher Lower Game',
  description: 'Who hit more home runs in 2018? Who stole more bases in 2012? The Higher Lower Game but with MLB Stats.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg"/>
        <PlausibleProvider domain="mlb-higher-lower-v2.vercel.app" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

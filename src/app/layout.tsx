import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import PlausibleProvider from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pokemon TCG Higher Lower Game',
  description: 'Test your Pokemon card knowledge!',
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
        {/* <script defer data-domain="mlbhigherlower.vercel.app" src="https://plausible.io/js/script.js"></script> */}
        {/* ^ to change */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AINA - Vadodara Heritage Guide',
  description: 'AI-powered heritage and tourism curator for Vadodara',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CPECC Careers | China Petroleum Engineering & Construction Corporation',
  description: 'Join CPECC - A leading EPC contractor for onshore oil & gas projects in the Middle East. Explore career opportunities and apply today.',
  generator: 'v0.app',
  openGraph: {
    title: 'CPECC Careers | China Petroleum Engineering & Construction Corporation',
    description: 'Join CPECC - A leading EPC contractor for onshore oil & gas projects in the Middle East.',
    siteName: 'CPECC Careers',
    locale: 'en_AE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CPECC Careers | China Petroleum Engineering & Construction Corporation',
    description: 'Join CPECC - A leading EPC contractor for onshore oil & gas projects in the Middle East.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

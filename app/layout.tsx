import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TalentTrack ATS - Modern Applicant Tracking System',
  description: 'TalentTrack ATS - A powerful, modern applicant tracking system for streamlined recruitment and hiring.',
  generator: 'v0.app',
  openGraph: {
    title: 'TalentTrack ATS - Modern Applicant Tracking System',
    description: 'A powerful, modern applicant tracking system for streamlined recruitment and hiring.',
    siteName: 'TalentTrack ATS',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentTrack ATS - Modern Applicant Tracking System',
    description: 'A powerful, modern applicant tracking system for streamlined recruitment and hiring.',
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

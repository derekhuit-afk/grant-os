import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Grant OS — Federal Grant Intelligence',
  description: 'AI-powered grant management for nonprofits and school districts. Built for OMB Uniform Guidance and GEPA Section 427 compliance.',
  keywords: 'grant management, nonprofit grants, school district grants, federal grants, GEPA 427, OMB Uniform Guidance, Single Audit',
  openGraph: {
    title: 'Grant OS',
    description: 'Federal grant intelligence for nonprofits and public institutions.',
    url: 'https://grantos.ai',
    siteName: 'Grant OS',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-cream font-sans antialiased">{children}</body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientProviders from './ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
         title: 'Biz Plus - AI Business Growth Platform',
         description: 'Transform your business with AI-powered insights and automation.',
}

export default function RootLayout({
         children,
}: {
         children: React.ReactNode
}) {
         return (
                  <html lang="en" suppressHydrationWarning>
                           <body className={inter.className}>
                                    <ClientProviders>
                                             {children}
                                    </ClientProviders>
                           </body>
                  </html>
         )
}

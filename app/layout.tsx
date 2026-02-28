import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { UserProvider } from '@/lib/context/user-context'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/react'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Fintrack - Seguimiento de Gastos y Presupuestos',
  description: 'Controla tus finanzas personales con seguimiento de gastos, presupuestos y reportes visuales. Soporte multi-moneda USD/COP.',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fintrack',
  },
}

export const viewport: Viewport = {
  themeColor: '#2cb67d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js')})}`,
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <UserProvider>
            {children}
            <Toaster richColors position="bottom-right" />
            <Analytics />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

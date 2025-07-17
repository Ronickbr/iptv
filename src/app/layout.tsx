'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import DynamicTitle from './components/DynamicTitle'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>IPTV Manager</title>
        <meta name="description" content="Sistema de Gerenciamento de IPTV" />
      </head>
      <body className={inter.className}>
        <DynamicTitle />
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
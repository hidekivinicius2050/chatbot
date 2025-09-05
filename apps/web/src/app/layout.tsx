import React from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chatbot 2.0 - Sistema de Atendimento Inteligente',
  description: 'Plataforma completa para gestão de atendimento ao cliente com chatbot, tickets, campanhas e automações',
  keywords: 'chatbot, atendimento, suporte, tickets, campanhas, automação, WhatsApp',
  authors: [{ name: 'Chatbot Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

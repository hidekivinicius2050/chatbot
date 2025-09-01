import React from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ShortcutsModal } from "@/components/ui/shortcuts-modal"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/lib/i18n'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Melhora performance de carregamento de fontes
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'AtendeChat 2.0',
  description: 'Plataforma de atendimento ao cliente',
  keywords: ['atendimento', 'chat', 'suporte', 'customer service'],
  authors: [{ name: 'AtendeChat Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

// Gera rotas estáticas para todos os locales
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <head>
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Skip Link para acessibilidade */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 z-50 bg-brand text-brand-foreground px-4 py-2 rounded-md shadow-lg transition-all duration-200"
          aria-label="Pular para o conteúdo principal"
        >
          Pular para o conteúdo
        </a>

        {/* Live Region para notificações */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only" 
          id="live-region"
        />

        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <ShortcutsModal open={false} onOpenChange={() => {}} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

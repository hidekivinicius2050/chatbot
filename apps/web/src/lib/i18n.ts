import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Lista de locales suportados
export const locales = ['pt-BR', 'en-US'] as const;
export type Locale = (typeof locales)[number];

// Configuração do next-intl
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    throw new Error('Locale is required');
  }
  
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale,
    timeZone: locale === 'pt-BR' ? 'America/Sao_Paulo' : 'America/New_York',
    now: new Date(),
  }
})

// Função para obter locale atual
export function getLocale(pathname: string): Locale {
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;
  
  if (locales.includes(locale)) {
    return locale;
  }
  
  return 'pt-BR'; // Fallback para português
}

// Função para obter pathname sem locale
export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/');
  const locale = segments[1] as Locale;
  
  if (locales.includes(locale)) {
    return '/' + segments.slice(2).join('/');
  }
  
  return pathname;
}

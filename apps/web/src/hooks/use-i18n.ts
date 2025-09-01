import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { locales, type Locale } from '@/lib/i18n';

export function useI18n() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Função para trocar idioma
  const changeLocale = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return;

    // Obter pathname sem locale atual
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
  }, [locale, pathname, router]);

  // Função para formatar data
  const formatDate = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  }, [locale]);

  // Função para formatar número
  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'decimal',
      ...options
    };

    return new Intl.NumberFormat(locale, defaultOptions).format(number);
  }, [locale]);

  // Função para formatar moeda
  const formatCurrency = useCallback((amount: number, currency = 'BRL') => {
    const currencyMap = {
      'pt-BR': 'BRL',
      'en-US': 'USD'
    };

    const currencyCode = currencyMap[locale as keyof typeof currencyMap] || currency;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  }, [locale]);

  // Função para formatar tempo relativo
  const formatRelativeTime = useCallback((date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    }
  }, [locale]);

  // Função para obter direção do texto
  const getTextDirection = useCallback(() => {
    return locale === 'en-US' ? 'ltr' : 'ltr'; // Ambos são LTR
  }, [locale]);

  // Função para obter locale nativo
  const getNativeLocaleName = useCallback(() => {
    const localeNames = {
      'pt-BR': 'Português',
      'en-US': 'English'
    };
    return localeNames[locale as keyof typeof localeNames] || locale;
  }, [locale]);

  return {
    t,
    locale,
    locales,
    changeLocale,
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
    getTextDirection,
    getNativeLocaleName,
    isRTL: false // Ambos os idiomas são LTR
  };
}

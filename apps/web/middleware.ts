import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // Lista de locales suportados
  locales: ['pt-BR', 'en-US'],
  
  // Locale padrão
  defaultLocale: 'pt-BR',
  
  // Detecção automática de locale baseada no header Accept-Language
  localeDetection: true,
});

export const config = {
  // Matcher para aplicar o middleware em todas as rotas exceto:
  // - API routes
  // - Static files
  // - _next/static
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

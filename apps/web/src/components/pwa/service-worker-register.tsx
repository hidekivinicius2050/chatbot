'use client';

import { useEffect } from 'react';
import { usePWA } from '@/hooks/use-pwa';

export function ServiceWorkerRegister() {
  const { registerSW } = usePWA();

  useEffect(() => {
    // Registrar Service Worker automaticamente quando o componente montar
    registerSW();
  }, [registerSW]);

  return null; // Componente não renderiza nada
}

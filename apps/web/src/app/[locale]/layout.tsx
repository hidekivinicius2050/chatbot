import React from 'react';
import { Shell } from '@/components/layout/shell';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';
import { InstallPrompt } from '@/components/pwa/install-prompt';

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <>
      <ServiceWorkerRegister />
      <Shell>
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </Shell>
      <InstallPrompt />
    </>
  );
}

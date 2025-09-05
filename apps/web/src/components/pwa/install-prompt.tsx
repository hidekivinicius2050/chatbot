'use client';

import { useState, useEffect } from 'react';
import { Download, X, Check } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';

export function InstallPrompt() {
  const { canInstall, isInstalled, installPWA, isLoading } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Mostrar prompt se PWA pode ser instalada e não foi instalada
    if (canInstall && !isInstalled && !isDismissed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [canInstall, isInstalled, isDismissed]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    
    // Salvar no localStorage para não mostrar novamente nesta sessão
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Verificar se foi descartado anteriormente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Instalar Chatbot
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Acesse mais rapidamente
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            disabled={isLoading}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Instalando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Instalar
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="px-4"
          >
            Agora não
          </Button>
        </div>

        {/* Benefits */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            Acesso offline
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            Notificações push
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3 h-3 text-green-500" />
            Como um app nativo
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  ticketId?: string;
  companyId?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  swVersion: string | null;
  notificationPermission: NotificationPermission;
  isSubscribed: boolean;
  isDndActive: boolean;
  dndUntil: string | null;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    swVersion: null,
    notificationPermission: 'default',
    isSubscribed: false,
    isDndActive: false,
    dndUntil: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const deferredPrompt = useRef<any>(null);
  const { toast } = useToast();

  // Verificar se PWA está instalada
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      
      setState(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    window.addEventListener('appinstalled', checkInstallation);
    
    return () => window.removeEventListener('appinstalled', checkInstallation);
  }, []);

  // Capturar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setState(prev => ({ ...prev, canInstall: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verificar permissão de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setState(prev => ({ 
        ...prev, 
        notificationPermission: Notification.permission 
      }));
    }
  }, []);

  // Registrar Service Worker
  const registerSW = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      toast({
        title: "PWA não suportado",
        description: "Seu navegador não suporta PWA",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('[PWA] SW registered:', registration);
      
      // Verificar versão
      const version = await new Promise<string>((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        
        registration.active?.postMessage(
          { type: 'GET_VERSION' }, 
          [channel.port2]
        );
        
        // Timeout fallback
        setTimeout(() => resolve('unknown'), 1000);
      });

      setState(prev => ({ ...prev, swVersion: version }));

      // Aguardar ativação
      await navigator.serviceWorker.ready;
      
      toast({
        title: "PWA ativado",
        description: "Service Worker registrado com sucesso",
      });

      return true;
    } catch (error) {
      console.error('[PWA] SW registration failed:', error);
      toast({
        title: "Erro ao ativar PWA",
        description: "Não foi possível registrar o Service Worker",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Instalar PWA
  const installPWA = useCallback(async () => {
    if (!deferredPrompt.current) {
      toast({
        title: "Instalação não disponível",
        description: "Aguarde o prompt de instalação aparecer",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, canInstall: false, isInstalled: true }));
        deferredPrompt.current = null;
        
        toast({
          title: "PWA instalada!",
          description: "AtendeChat foi instalado com sucesso",
        });
        
        return true;
      } else {
        toast({
          title: "Instalação cancelada",
          description: "Você pode instalar depois pelo menu do navegador",
        });
        return false;
      }
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
      toast({
        title: "Erro na instalação",
        description: "Não foi possível instalar o PWA",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Solicitar permissão de notificação
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, notificationPermission: permission }));
      
      if (permission === 'granted') {
        toast({
          title: "Notificações ativadas",
          description: "Você receberá notificações do AtendeChat",
        });
        return true;
      } else {
        toast({
          title: "Permissão negada",
          description: "As notificações não funcionarão sem permissão",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('[PWA] Permission request failed:', error);
      toast({
        title: "Erro ao solicitar permissão",
        description: "Não foi possível ativar as notificações",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Inscrever para push notifications
  const subscribeToPush = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: "Push não suportado",
        description: "Seu navegador não suporta push notifications",
        variant: "destructive"
      });
      return false;
    }

    if (state.notificationPermission !== 'granted') {
      const granted = await requestNotificationPermission();
      if (!granted) return false;
    }

    try {
      setIsLoading(true);
      
      const registration = await navigator.serviceWorker.ready;
      
      // Converter VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key não configurada');
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as ArrayBuffer
      });

      // Enviar para API
      const response = await fetch('/api/v1/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          },
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao registrar subscription');
      }

      setState(prev => ({ ...prev, isSubscribed: true }));
      
      toast({
        title: "Push ativado",
        description: "Você receberá notificações push",
      });

      return true;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      toast({
        title: "Erro ao ativar push",
        description: "Não foi possível ativar as notificações push",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.notificationPermission, requestNotificationPermission, toast]);

  // Cancelar inscrição push
  const unsubscribeFromPush = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notificar API
        await fetch('/api/v1/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }

      setState(prev => ({ ...prev, isSubscribed: false }));
      
      toast({
        title: "Push desativado",
        description: "Você não receberá mais notificações push",
      });

      return true;
    } catch (error) {
      console.error('[PWA] Push unsubscription failed:', error);
      toast({
        title: "Erro ao desativar push",
        description: "Não foi possível desativar as notificações push",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Testar notificação
  const testNotification = useCallback(async () => {
    if (state.notificationPermission !== 'granted') {
      toast({
        title: "Permissão necessária",
        description: "Ative as notificações primeiro",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Enviar para API para teste
      const response = await fetch('/api/v1/me/notify-test', {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "Notificação de teste enviada",
          description: "Verifique se recebeu a notificação",
        });
        return true;
      } else {
        throw new Error('Falha no teste');
      }
    } catch (error) {
      console.error('[PWA] Test notification failed:', error);
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar notificação de teste",
        variant: "destructive"
      });
      return false;
    }
  }, [state.notificationPermission, toast]);

  // Verificar DND
  const checkDND = useCallback(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    
    // TODO: Buscar preferências do usuário da API
    const dndStart = '22:00';
    const dndEnd = '07:00';
    
    let isDndActive = false;
    let dndUntil = null;
    
    if (dndStart < dndEnd) {
      // DND durante a noite (ex: 22:00 - 07:00)
      isDndActive = currentTime >= dndStart || currentTime <= dndEnd;
      dndUntil = currentTime >= dndStart ? 
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 1).padStart(2, '0')} ${dndEnd}:00` :
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${dndEnd}:00`;
    } else {
      // DND durante o dia (ex: 07:00 - 22:00)
      isDndActive = currentTime >= dndStart || currentTime <= dndEnd;
      dndUntil = currentTime >= dndStart ? 
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate() + 1).padStart(2, '0')} ${dndEnd}:00` :
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${dndEnd}:00`;
    }
    
    setState(prev => ({ ...prev, isDndActive, dndUntil }));
  }, []);

  // Verificar DND periodicamente
  useEffect(() => {
    checkDND();
    const interval = setInterval(checkDND, 60000); // A cada minuto
    
    return () => clearInterval(interval);
  }, [checkDND]);

  // Atualizar SW quando nova versão disponível
  const updateSW = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
    }
  }, []);

  // Converter VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return {
    ...state,
    isLoading,
    registerSW,
    installPWA,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification,
    updateSW,
    checkDND
  };
}

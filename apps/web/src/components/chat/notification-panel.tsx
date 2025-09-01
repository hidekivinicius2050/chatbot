'use client';

import { useState } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Moon, Wifi, WifiOff, Settings } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationPanelProps {
  className?: string;
}

const SOUND_OPTIONS = [
  { value: 'ping-1', label: 'Ping Suave' },
  { value: 'ping-2', label: 'Ping Alto' },
  { value: 'chime', label: 'Sino' },
  { value: 'notification', label: 'Notificação' },
  { value: 'none', label: 'Sem Som' }
];

export function NotificationPanel({ className }: NotificationPanelProps) {
  const {
    isOnline,
    notificationPermission,
    isSubscribed,
    isDndActive,
    dndUntil,
    isLoading,
    requestNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    testNotification
  } = usePWA();

  const [quickSound, setQuickSound] = useState('ping-1');
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  const handleQuickSoundChange = (sound: string) => {
    setQuickSound(sound);
    // TODO: Salvar preferência do usuário
  };

  const handleTestSound = (sound: string) => {
    if (sound === 'none') return;
    
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(console.error);
  };

  const getConnectionStatus = () => {
    if (!isOnline) return { icon: WifiOff, color: 'text-red-500', label: 'Offline' };
    return { icon: Wifi, color: 'text-green-500', label: 'Online' };
  };

  const getNotificationStatus = () => {
    if (notificationPermission === 'granted') {
      return { icon: Bell, color: 'text-green-500', label: 'Ativo' };
    }
    return { icon: BellOff, color: 'text-gray-400', label: 'Inativo' };
  };

  const getDndStatus = () => {
    if (isDndActive) {
      return { icon: Moon, color: 'text-violet-500', label: 'DND Ativo' };
    }
    return { icon: Bell, color: 'text-gray-400', label: 'DND Inativo' };
  };

  const ConnectionStatus = getConnectionStatus();
  const NotificationStatus = getNotificationStatus();
  const DndStatus = getDndStatus();

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Status de Conexão */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <ConnectionStatus.icon className={`w-4 h-4 ${ConnectionStatus.color}`} />
              <Badge 
                variant={isOnline ? 'default' : 'secondary'}
                className={`text-xs ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {ConnectionStatus.label}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Status da conexão WebSocket</p>
          </TooltipContent>
        </Tooltip>

        {/* Status de Notificações */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <NotificationStatus.icon className={`w-4 h-4 ${NotificationStatus.color}`} />
              <Badge 
                variant={notificationPermission === 'granted' ? 'default' : 'secondary'}
                className={`text-xs ${notificationPermission === 'granted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {NotificationStatus.label}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Status das notificações</p>
          </TooltipContent>
        </Tooltip>

        {/* Status do DND */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <DndStatus.icon className={`w-4 h-4 ${DndStatus.color}`} />
              <Badge 
                variant={isDndActive ? 'default' : 'secondary'}
                className={`text-xs ${isDndActive ? 'bg-violet-100 text-violet-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {DndStatus.label}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isDndActive 
                ? `Modo silencioso ativo até ${dndUntil}` 
                : 'Modo silencioso inativo'
              }
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Controle Rápido de Som */}
        <Popover open={showQuickSettings} onOpenChange={setShowQuickSettings}>
          <PopoverTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {quickSound === 'none' ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurações rápidas de som</p>
              </TooltipContent>
            </Tooltip>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Som de Notificação</Label>
                <Select value={quickSound} onValueChange={handleQuickSoundChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUND_OPTIONS.map((sound) => (
                      <SelectItem key={sound.value} value={sound.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{sound.label}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              handleTestSound(sound.value);
                            }}
                            className="ml-2 h-6 px-2"
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Teste Rápido</Label>
                <Button
                  onClick={() => handleTestSound(quickSound)}
                  disabled={quickSound === 'none'}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Testar Som
                </Button>
              </div>

              <div className="pt-2 border-t">
                <Button
                  onClick={() => setShowQuickSettings(false)}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Botão de Configurações */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => window.location.href = '/settings/notifications'}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Configurações completas de notificações</p>
          </TooltipContent>
        </Tooltip>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

        {/* Ações Rápidas */}
        <div className="flex items-center gap-1">
          {/* Toggle DND Rápido */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isDndActive ? 'default' : 'outline'}
                size="sm"
                className={`h-8 px-3 ${
                  isDndActive 
                    ? 'bg-violet-600 hover:bg-violet-700 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => {
                  // TODO: Toggle DND via API
                }}
              >
                <Moon className="w-4 h-4 mr-1" />
                {isDndActive ? 'DND' : 'DND'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isDndActive 
                  ? 'Desativar modo silencioso' 
                  : 'Ativar modo silencioso'
                }
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Teste de Notificação */}
          {notificationPermission === 'granted' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={testNotification}
                  disabled={isLoading}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Teste
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enviar notificação de teste</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

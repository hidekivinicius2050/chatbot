'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, BellOff, Volume2, VolumeX, Moon, Sun, Clock, Settings } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SOUND_OPTIONS = [
  { value: 'ping-1', label: 'Ping Suave', description: 'Som padrão do sistema' },
  { value: 'ping-2', label: 'Ping Alto', description: 'Som mais audível' },
  { value: 'chime', label: 'Sino', description: 'Som elegante e discreto' },
  { value: 'notification', label: 'Notificação', description: 'Som tradicional' },
  { value: 'none', label: 'Sem Som', description: 'Apenas notificação visual' }
];

export default function NotificationsSettingsPage() {
  const t = useTranslations('settings.notifications');
  const {
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

  const [preferences, setPreferences] = useState({
    notifications: true,
    desktop: true,
    push: true,
    sound: 'ping-1',
    dndEnabled: false,
    dndStart: '22:00',
    dndEnd: '07:00'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Carregar preferências do usuário
  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/v1/me/preferences');
      if (response.ok) {
        const userPrefs = await response.json();
        setPreferences(prev => ({ ...prev, ...userPrefs }));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/v1/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        // Atualizar estado local
        setPreferences(prev => ({ ...prev }));
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleTestSound = (sound: string) => {
    if (sound === 'none') return;

    // Criar elemento de áudio para preview
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  const formatDndTime = (time: string) => {
    return time;
  };

  const getDndStatusText = () => {
    if (!preferences.dndEnabled) return 'Desativado';
    if (isDndActive) {
      return `Ativo até ${formatDndTime(preferences.dndEnd)}`;
    }
    return `Ativo das ${formatDndTime(preferences.dndStart)} às ${formatDndTime(preferences.dndEnd)}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurações Gerais */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Settings className="w-5 h-5 text-violet-600" />
              {t('general.title')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t('general.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('general.master')}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('general.masterDescription')}
                </p>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            <Separator />

            {/* Desktop Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('general.desktop')}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('general.desktopDescription')}
                </p>
              </div>
              <Switch
                checked={preferences.desktop && preferences.notifications}
                onCheckedChange={(checked) => handlePreferenceChange('desktop', checked)}
                disabled={!preferences.notifications}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            <Separator />

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('general.push')}
                </Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('general.pushDescription')}
                </p>
              </div>
              <Switch
                checked={preferences.push && preferences.notifications}
                onCheckedChange={(checked) => handlePreferenceChange('push', checked)}
                disabled={!preferences.notifications}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Status das Permissões */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Permissão do Navegador:
                </span>
                <Badge 
                  variant={notificationPermission === 'granted' ? 'default' : 'secondary'}
                  className={notificationPermission === 'granted' ? 'bg-green-100 text-green-800' : ''}
                >
                  {notificationPermission === 'granted' ? 'Concedida' : 'Não concedida'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Push Ativo:
                </span>
                <Badge 
                  variant={isSubscribed ? 'default' : 'secondary'}
                  className={isSubscribed ? 'bg-blue-100 text-blue-800' : ''}
                >
                  {isSubscribed ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              {notificationPermission !== 'granted' && (
                <Button
                  onClick={requestNotificationPermission}
                  disabled={isLoading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {isLoading ? 'Solicitando...' : 'Permitir Notificações'}
                </Button>
              )}
              
              {notificationPermission === 'granted' && !isSubscribed && (
                <Button
                  onClick={subscribeToPush}
                  disabled={isLoading}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {isLoading ? 'Ativando...' : 'Ativar Push'}
                </Button>
              )}
              
              {isSubscribed && (
                <Button
                  onClick={unsubscribeFromPush}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoading ? 'Desativando...' : 'Desativar Push'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Som e DND */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Volume2 className="w-5 h-5 text-violet-600" />
              {t('sound.title')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t('sound.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Seleção de Som */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t('sound.select')}
              </Label>
              <Select
                value={preferences.sound}
                onValueChange={(value) => handlePreferenceChange('sound', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um som" />
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

            <Separator />

            {/* DND - Do Not Disturb */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('dnd.title')}
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('dnd.description')}
                  </p>
                </div>
                <Switch
                  checked={preferences.dndEnabled}
                  onCheckedChange={(checked) => handlePreferenceChange('dndEnabled', checked)}
                  className="data-[state=checked]:bg-violet-600"
                />
              </div>

              {preferences.dndEnabled && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        {t('dnd.start')}
                      </Label>
                      <Input
                        type="time"
                        value={preferences.dndStart}
                        onChange={(e) => handlePreferenceChange('dndStart', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600 dark:text-gray-400">
                        {t('dnd.end')}
                      </Label>
                      <Input
                        type="time"
                        value={preferences.dndEnd}
                        onChange={(e) => handlePreferenceChange('dndEnd', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Status do DND */}
                  <div className="flex items-center gap-2 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                    {isDndActive ? (
                      <Moon className="w-4 h-4 text-violet-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-violet-600" />
                    )}
                    <span className="text-sm text-violet-700 dark:text-violet-300">
                      {getDndStatusText()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teste de Notificação */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Bell className="w-5 h-5 text-violet-600" />
            {t('test.title')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('test.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={testNotification}
              disabled={isLoading || notificationPermission !== 'granted'}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? 'Enviando...' : 'Testar Notificação'}
            </Button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {notificationPermission !== 'granted' && 
                'Permita notificações primeiro para testar'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="bg-violet-600 hover:bg-violet-700 px-8"
        >
          {isSaving ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
}

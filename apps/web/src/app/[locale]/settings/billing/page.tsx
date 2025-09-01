'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  MessageSquare, 
  Hash, 
  Settings,
  Crown,
  Zap,
  Building,
  Star
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  price: string;
  description: string;
  features: string[];
  limits: {
    messages: number;
    contacts: number;
    channels: number;
    seats: number;
  };
  popular?: boolean;
}

interface Subscription {
  id: string;
  plan: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
}

interface Usage {
  messages: { used: number; max: number; percentage: number };
  contacts: { used: number; max: number; percentage: number };
  channels: { used: number; max: number; percentage: number };
  seats: { used: number; max: number; percentage: number };
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'FREE',
    price: 'Grátis',
    description: 'Ideal para começar e testar a plataforma',
    features: [
      'Até 2 usuários',
      '1 canal WhatsApp',
      '3.000 mensagens/mês',
      '500 contatos',
      'Suporte por e-mail',
      'Retenção: 90 dias'
    ],
    limits: {
      messages: 3000,
      contacts: 500,
      channels: 1,
      seats: 2
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'PRO',
    price: 'R$ 99/mês',
    description: 'Para equipes pequenas que precisam crescer',
    features: [
      'Até 10 usuários',
      '3 canais WhatsApp',
      '50.000 mensagens/mês',
      '10.000 contatos',
      'Automações básicas',
      'Relatórios avançados',
      'Suporte prioritário',
      'Retenção: 1 ano'
    ],
    limits: {
      messages: 50000,
      contacts: 10000,
      channels: 3,
      seats: 10
    },
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    tier: 'BUSINESS',
    price: 'R$ 299/mês',
    description: 'Para empresas com múltiplas equipes',
    features: [
      'Até 50 usuários',
      '10 canais WhatsApp',
      '250.000 mensagens/mês',
      '50.000 contatos',
      'Automações avançadas',
      'Campanhas de marketing',
      'API completa',
      'Suporte dedicado',
      'Retenção: 2 anos'
    ],
    limits: {
      messages: 250000,
      contacts: 50000,
      channels: 10,
      seats: 50
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    price: 'Sob consulta',
    description: 'Soluções personalizadas para grandes empresas',
    features: [
      'Usuários ilimitados',
      'Canais ilimitados',
      'Mensagens ilimitadas',
      'Contatos ilimitados',
      'Integrações customizadas',
      'SLA garantido',
      'Gerente de conta',
      'Retenção: 10 anos'
    ],
    limits: {
      messages: 999999999,
      contacts: 999999999,
      channels: 999,
      seats: 999
    }
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'trialing': return 'bg-blue-500';
    case 'past_due': return 'bg-yellow-500';
    case 'canceled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'trialing': return 'Período de teste';
    case 'past_due': return 'Pagamento pendente';
    case 'canceled': return 'Cancelado';
    default: return 'Desconhecido';
  }
};

export default function BillingPage() {
  const t = useTranslations('Billing');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - em produção, buscar da API
    setTimeout(() => {
      setSubscription({
        id: 'sub_123',
        plan: 'pro',
        status: 'active',
        currentPeriodStart: '2024-12-01T00:00:00Z',
        currentPeriodEnd: '2025-01-01T00:00:00Z',
        trialEndsAt: '2024-12-15T00:00:00Z'
      });

      setUsage({
        messages: { used: 12500, max: 50000, percentage: 25 },
        contacts: { used: 2500, max: 10000, percentage: 25 },
        channels: { used: 2, max: 3, percentage: 67 },
        seats: { used: 5, max: 10, percentage: 50 }
      });

      setLoading(false);
    }, 1000);
  }, []);

  const handleUpgrade = (planId: string) => {
    // Em produção, redirecionar para checkout
    console.log('Upgrade to plan:', planId);
    window.open(`/settings/billing/checkout?plan=${planId}`, '_blank');
  };

  const handleManage = () => {
    // Em produção, redirecionar para portal do cliente
    console.log('Manage subscription');
    window.open('/settings/billing/portal', '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('description')}
          </p>
        </div>
        <Button variant="outline" onClick={handleManage}>
          <Settings className="w-4 h-4 mr-2" />
          {t('manage')}
        </Button>
      </div>

      {/* Status da Assinatura */}
      {subscription && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('currentPlan')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${getStatusColor(subscription.status)} text-white`}
                  >
                    {getStatusText(subscription.status)}
                  </Badge>
                  <span className="text-lg font-semibold capitalize">
                    {subscription.plan}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('period')}: {new Date(subscription.currentPeriodStart).toLocaleDateString('pt-BR')} - {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </p>
                {subscription.trialEndsAt && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('trialEnds')}: {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {plans.find(p => p.id === subscription.plan)?.price}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('perMonth')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uso Atual */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle>{t('currentUsage')}</CardTitle>
            <CardDescription>
              {t('usageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">{t('messages')}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.messages.used.toLocaleString()} / {usage.messages.max.toLocaleString()}
                  </span>
                </div>
                <Progress value={usage.messages.percentage} className="h-2" />
                {usage.messages.percentage > 80 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('approachingLimit')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{t('contacts')}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.contacts.used.toLocaleString()} / {usage.contacts.max.toLocaleString()}
                  </span>
                </div>
                <Progress value={usage.contacts.percentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className="font-medium">{t('channels')}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.channels.used} / {usage.channels.max}
                  </span>
                </div>
                <Progress value={usage.channels.percentage} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{t('seats')}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.seats.used} / {usage.seats.max}
                  </span>
                </div>
                <Progress value={usage.seats.percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planos Disponíveis */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('availablePlans')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('plansDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    {t('mostPopular')}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {plan.tier === 'FREE' && <Star className="w-6 h-6 text-yellow-500" />}
                  {plan.tier === 'PRO' && <Zap className="w-6 h-6 text-blue-500" />}
                  {plan.tier === 'BUSINESS' && <Building className="w-6 h-6 text-purple-500" />}
                  {plan.tier === 'ENTERPRISE' && <Crown className="w-6 h-6 text-orange-500" />}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {plan.price}
                </div>
                <CardDescription className="text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('messages')}:</span>
                    <span className="font-medium">{plan.limits.messages.toLocaleString()}/mês</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('contacts')}:</span>
                    <span className="font-medium">{plan.limits.contacts.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('channels')}:</span>
                    <span className="font-medium">{plan.limits.channels}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t('seats')}:</span>
                    <span className="font-medium">{plan.limits.seats}</span>
                  </div>
                </div>

                <Button 
                  className="w-full"
                  variant={plan.id === subscription?.plan ? 'outline' : 'default'}
                  onClick={() => plan.id === subscription?.plan ? handleManage() : handleUpgrade(plan.id)}
                >
                  {plan.id === subscription?.plan ? t('manage') : t('upgrade')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>{t('additionalInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">{t('billing')}</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {t('billingMonthly')}</li>
                <li>• {t('billingCancel')}</li>
                <li>• {t('billingRefund')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('support')}</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {t('supportEmail')}</li>
                <li>• {t('supportDocs')}</li>
                <li>• {t('supportPriority')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  UserCheck,
  Lock,
  Calendar,
  Info
} from 'lucide-react';

interface ConsentEvent {
  id: string;
  kind: 'TERMS' | 'PRIVACY' | 'COOKIES';
  accepted: boolean;
  createdAt: string;
  ip?: string;
}

interface DsrRequest {
  id: string;
  kind: 'ACCESS' | 'EXPORT' | 'DELETE' | 'RECTIFICATION';
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requesterEmail: string;
  reason?: string;
  createdAt: string;
  resultPath?: string;
}

interface ComplianceSummary {
  consentEvents: number;
  dsrRequests: number;
  pendingDsr: number;
  retentionDays: number;
  lastCleanup?: string;
}

const getConsentKindText = (kind: string) => {
  switch (kind) {
    case 'TERMS': return 'Termos de Uso';
    case 'PRIVACY': return 'Política de Privacidade';
    case 'COOKIES': return 'Política de Cookies';
    default: return kind;
  }
};

const getDsrKindText = (kind: string) => {
  switch (kind) {
    case 'ACCESS': return 'Acesso aos Dados';
    case 'EXPORT': return 'Exportar Dados';
    case 'DELETE': return 'Excluir Dados';
    case 'RECTIFICATION': return 'Retificar Dados';
    default: return kind;
  }
};

const getDsrStatusColor = (status: string) => {
  switch (status) {
    case 'REQUESTED': return 'bg-yellow-500';
    case 'IN_PROGRESS': return 'bg-blue-500';
    case 'COMPLETED': return 'bg-green-500';
    case 'REJECTED': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getDsrStatusText = (status: string) => {
  switch (status) {
    case 'REQUESTED': return 'Solicitado';
    case 'IN_PROGRESS': return 'Em Processamento';
    case 'COMPLETED': return 'Concluído';
    case 'REJECTED': return 'Rejeitado';
    default: return status;
  }
};

export default function CompliancePage() {
  const t = useTranslations('Compliance');
  const [consentEvents, setConsentEvents] = useState<ConsentEvent[]>([]);
  const [dsrRequests, setDsrRequests] = useState<DsrRequest[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDsrForm, setShowDsrForm] = useState(false);
  const [dsrForm, setDsrForm] = useState({
    kind: 'EXPORT' as const,
    requesterEmail: '',
    reason: ''
  });

  useEffect(() => {
    // Mock data - em produção, buscar da API
    setTimeout(() => {
      setConsentEvents([
        {
          id: '1',
          kind: 'TERMS',
          accepted: true,
          createdAt: '2024-12-01T10:00:00Z',
          ip: '127.0.0.1'
        },
        {
          id: '2',
          kind: 'PRIVACY',
          accepted: true,
          createdAt: '2024-12-01T10:00:00Z',
          ip: '127.0.0.1'
        },
        {
          id: '3',
          kind: 'COOKIES',
          accepted: true,
          createdAt: '2024-12-01T10:00:00Z',
          ip: '127.0.0.1'
        }
      ]);

      setDsrRequests([
        {
          id: '1',
          kind: 'EXPORT',
          status: 'COMPLETED',
          requesterEmail: 'usuario@exemplo.com',
          reason: 'Solicitação de dados pessoais',
          createdAt: '2024-12-01T10:00:00Z',
          resultPath: '/storage/dsr/export-1.zip'
        },
        {
          id: '2',
          kind: 'DELETE',
          status: 'IN_PROGRESS',
          requesterEmail: 'excluir@exemplo.com',
          reason: 'Direito ao esquecimento',
          createdAt: '2024-12-02T10:00:00Z'
        }
      ]);

      setSummary({
        consentEvents: 3,
        dsrRequests: 2,
        pendingDsr: 1,
        retentionDays: 365
      });

      setLoading(false);
    }, 1000);
  }, []);

  const handleDsrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Em produção, enviar para API
    console.log('DSR request:', dsrForm);
    
    const newRequest: DsrRequest = {
      id: Date.now().toString(),
      kind: dsrForm.kind,
      status: 'REQUESTED',
      requesterEmail: dsrForm.kind === 'EXPORT' ? dsrForm.requesterEmail : 'usuario@exemplo.com',
      reason: dsrForm.reason,
      createdAt: new Date().toISOString()
    };

    setDsrRequests(prev => [newRequest, ...prev]);
    setShowDsrForm(false);
    setDsrForm({ kind: 'EXPORT', requesterEmail: '', reason: '' });
  };

  const handleDownloadExport = (requestId: string) => {
    // Em produção, baixar arquivo da API
    console.log('Download export for request:', requestId);
    window.open(`/api/v1/compliance/dsr/${requestId}/download`, '_blank');
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
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Resumo de Conformidade */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('consentEvents')}</p>
                  <p className="text-2xl font-bold">{summary.consentEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('dsrRequests')}</p>
                  <p className="text-2xl font-bold">{summary.dsrRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('pendingDsr')}</p>
                  <p className="text-2xl font-bold">{summary.pendingDsr}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('retentionDays')}</p>
                  <p className="text-2xl font-bold">{summary.retentionDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consentimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            {t('consentHistory')}
          </CardTitle>
          <CardDescription>
            {t('consentDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {consentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={event.accepted ? 'default' : 'destructive'}>
                    {event.accepted ? 'Aceito' : 'Rejeitado'}
                  </Badge>
                  <span className="font-medium">{getConsentKindText(event.kind)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{new Date(event.createdAt).toLocaleDateString('pt-BR')}</p>
                  {event.ip && <p className="text-xs">IP: {event.ip}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DSR Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                {t('dsrRequests')}
              </CardTitle>
              <CardDescription>
                {t('dsrDescription')}
              </CardDescription>
            </div>
            <Button onClick={() => setShowDsrForm(true)}>
              {t('newRequest')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showDsrForm && (
            <Card className="mb-4 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">{t('newDsrRequest')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDsrSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="kind">{t('requestType')}</Label>
                    <select
                      id="kind"
                      value={dsrForm.kind}
                      onChange={(e) => setDsrForm(prev => ({ ...prev, kind: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="EXPORT">Exportar Dados</option>
                      <option value="DELETE">Excluir Dados</option>
                      <option value="ACCESS">Acesso aos Dados</option>
                      <option value="RECTIFICATION">Retificar Dados</option>
                    </select>
                  </div>

                  {dsrForm.kind === 'EXPORT' && (
                    <div>
                      <Label htmlFor="email">{t('email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={dsrForm.requesterEmail}
                        onChange={(e) => setDsrForm(prev => ({ ...prev, requesterEmail: e.target.value }))}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reason">{t('reason')}</Label>
                    <Textarea
                      id="reason"
                      value={dsrForm.reason}
                      onChange={(e) => setDsrForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder={t('reasonPlaceholder')}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      {t('submit')}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowDsrForm(false)}>
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {dsrRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={`${getDsrStatusColor(request.status)} text-white`}>
                    {getDsrStatusText(request.status)}
                  </Badge>
                  <div>
                    <span className="font-medium">{getDsrKindText(request.kind)}</span>
                    {request.requesterEmail && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.requesterEmail}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
                    <p>{new Date(request.createdAt).toLocaleDateString('pt-BR')}</p>
                    {request.reason && (
                      <p className="text-xs max-w-xs truncate">{request.reason}</p>
                    )}
                  </div>
                  
                  {request.status === 'COMPLETED' && request.resultPath && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadExport(request.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {t('download')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Políticas de Retenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-500" />
            {t('retentionPolicy')}
          </CardTitle>
          <CardDescription>
            {t('retentionDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  {t('freePlan')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('retentionFree')}: 90 dias
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  {t('proPlan')}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('retentionPro')}: 1 ano
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                  {t('businessPlan')}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('retentionBusiness')}: 2 anos
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  {t('enterprisePlan')}
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {t('retentionEnterprise')}: 10 anos
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    {t('important')}
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('retentionWarning')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            {t('contactInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>{t('dpo')}:</strong> privacidade@seudominio.com
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>{t('privacyPolicy')}:</strong> 
                <a href="/privacy" className="text-blue-600 hover:underline ml-1">
                  {t('viewPolicy')}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                <strong>{t('termsOfService')}:</strong> 
                <a href="/terms" className="text-blue-600 hover:underline ml-1">
                  {t('viewTerms')}
                </a>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


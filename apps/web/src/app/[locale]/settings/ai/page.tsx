'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Settings, 
  TestTube, 
  Shield, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AISettingsPage() {
  const t = useTranslations('ai');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  // Estados para as configurações
  const [aiProvider, setAiProvider] = useState('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [chatModel, setChatModel] = useState('gpt-4o-mini');
  const [embedModel, setEmbedModel] = useState('text-embedding-3-small');
  const [maxTokensPerDay, setMaxTokensPerDay] = useState('200000');
  const [enableSummarize, setEnableSummarize] = useState(true);
  const [enableSuggestions, setEnableSuggestions] = useState(true);
  const [enableAutotag, setEnableAutotag] = useState(true);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult('success');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      // TODO: Implementar salvamento real
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-violet-500" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações de IA</h1>
          <p className="text-muted-foreground">
            Configure a inteligência artificial para melhorar o atendimento
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurações do Provider */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Provider de IA
            </CardTitle>
            <CardDescription>
              Configure o provedor de IA e suas credenciais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="azureopenai">Azure OpenAI (Futuro)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-key">Chave da API</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chat-model">Modelo de Chat</Label>
                <Select value={chatModel} onValueChange={setChatModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embed-model">Modelo de Embedding</Label>
                <Select value={embedModel} onValueChange={setEmbedModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                    <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading || !openaiKey}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isLoading ? 'Testando...' : 'Testar Conexão'}
            </Button>

            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                testResult === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {testResult === 'success' 
                  ? 'Conexão bem-sucedida!' 
                  : 'Falha na conexão. Verifique suas credenciais.'
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limites e Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Limites e Controles
            </CardTitle>
            <CardDescription>
              Configure limites de uso e funcionalidades habilitadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Máximo de Tokens por Dia</Label>
              <Input
                id="max-tokens"
                type="number"
                placeholder="200000"
                value={maxTokensPerDay}
                onChange={(e) => setMaxTokensPerDay(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Limite diário para proteger contra custos excessivos
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sumarização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Gera resumos automáticos dos tickets
                  </p>
                </div>
                <Switch
                  checked={enableSummarize}
                  onCheckedChange={setEnableSummarize}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sugestões de Resposta</Label>
                  <p className="text-sm text-muted-foreground">
                    Sugere respostas baseadas na KB
                  </p>
                </div>
                <Switch
                  checked={enableSuggestions}
                  onCheckedChange={setEnableSuggestions}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-tagging</Label>
                  <p className="text-sm text-muted-foreground">
                    Classifica automaticamente tickets
                  </p>
                </div>
                <Switch
                  checked={enableAutotag}
                  onCheckedChange={setEnableAutotag}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status e Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Status e Métricas
          </CardTitle>
          <CardDescription>
            Monitoramento do uso da IA e funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">2.4k</div>
              <div className="text-sm text-muted-foreground">Tokens usados hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-muted-foreground">Sugestões geradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">89%</div>
              <div className="text-sm text-muted-foreground">Taxa de acerto</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avisos de Segurança */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Segurança e Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700">
          <div className="space-y-2">
            <p className="text-sm">
              • <strong>PII Redaction:</strong> Dados sensíveis são automaticamente removidos dos prompts
            </p>
            <p className="text-sm">
              • <strong>Logs Seguros:</strong> Apenas custos agregados são registrados, não o conteúdo dos prompts
            </p>
            <p className="text-sm">
              • <strong>Controle por Tenant:</strong> Cada empresa tem seus próprios limites e configurações
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}

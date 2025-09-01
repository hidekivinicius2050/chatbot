'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Lightbulb, 
  FileText, 
  Tag, 
  RefreshCw,
  Copy,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface AIPanelProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  text: string;
  confidence: number;
}

interface TicketInsights {
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags: string[];
  lastUpdated?: string;
}

// Mock data para demonstração
const mockSuggestions: Suggestion[] = [
  {
    id: '1',
    text: 'Peço desculpas pelo inconveniente. Para solicitar a troca, precisamos de fotos do produto e número do pedido. Posso ajudá-lo com isso?',
    confidence: 0.92,
  },
  {
    id: '2',
    text: 'Segundo nossa política de trocas, o prazo é de 30 dias após a compra. Vou verificar os detalhes do seu pedido.',
    confidence: 0.87,
  },
  {
    id: '3',
    text: 'Entendo sua preocupação. Vou transferir para um especialista em trocas que poderá ajudá-lo melhor.',
    confidence: 0.78,
  },
];

const mockInsights: TicketInsights = {
  summary: 'Cliente João Silva relatou problema com produto que chegou com defeito. Tentou contato anterior sem sucesso. Sentimento: frustrado. Próximo passo: verificar política de trocas e orientar processo.',
  sentiment: 'negative',
  tags: ['defeito', 'produto', 'troca'],
  lastUpdated: '2024-12-19T15:30:00Z',
};

export function AIPanel({ ticketId, isOpen, onClose }: AIPanelProps) {
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingAutotag, setIsLoadingAutotag] = useState(false);
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implementar chamada real para /api/v1/tickets/:id/suggest
    } catch (error) {
      console.error('Erro ao obter sugestões:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 3000));
      // TODO: Implementar chamada real para /api/v1/tickets/:id/summarize
    } catch (error) {
      console.error('Erro ao gerar sumário:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleAutoTag = async () => {
    setIsLoadingAutotag(true);
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implementar chamada real para /api/v1/tickets/:id/autotag
    } catch (error) {
      console.error('Erro ao auto-tagging:', error);
    } finally {
      setIsLoadingAutotag(false);
    }
  };

  const handleCopySuggestion = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSuggestion(id);
      setTimeout(() => setCopiedSuggestion(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    const variants = {
      positive: 'default',
      neutral: 'secondary',
      negative: 'destructive',
    } as const;

    return (
      <Badge variant={variants[sentiment as keyof typeof variants] || 'secondary'}>
        {sentiment === 'positive' ? 'Positivo' : 
         sentiment === 'negative' ? 'Negativo' : 'Neutro'}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-background border-l border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-500" />
            <h3 className="font-semibold">Assistente IA</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Sugestões de Resposta */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Sugestões de Resposta
            </CardTitle>
            <CardDescription className="text-xs">
              Baseadas na Base de Conhecimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleGetSuggestions}
              disabled={isLoadingSuggestions}
              size="sm"
              className="w-full"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
              {isLoadingSuggestions ? 'Gerando...' : 'Gerar Sugestões'}
            </Button>

            {mockSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Confiança: {Math.round(suggestion.confidence * 100)}%
                </div>
                <div className="p-3 bg-muted rounded-md text-sm">
                  {suggestion.text}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleCopySuggestion(suggestion.text, suggestion.id)}
                >
                  {copiedSuggestion === suggestion.id ? (
                    <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 mr-2" />
                  )}
                  {copiedSuggestion === suggestion.id ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        {/* Sumário do Ticket */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Sumário do Ticket
            </CardTitle>
            <CardDescription className="text-xs">
              Resumo automático da conversa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleGenerateSummary}
              disabled={isLoadingSummary}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoadingSummary ? 'animate-spin' : ''}`} />
              {isLoadingSummary ? 'Gerando...' : 'Gerar Sumário'}
            </Button>

            {mockInsights.summary && (
              <div className="p-3 bg-muted rounded-md text-sm">
                {mockInsights.summary}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Análise e Tags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
              Análise e Tags
            </CardTitle>
            <CardDescription className="text-xs">
              Sentimento e classificação automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleAutoTag}
              disabled={isLoadingAutotag}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoadingAutotag ? 'animate-spin' : ''}`} />
              {isLoadingAutotag ? 'Analisando...' : 'Analisar Ticket'}
            </Button>

            {mockInsights.sentiment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(mockInsights.sentiment)}
                  <span className="text-sm font-medium">Sentimento:</span>
                  {getSentimentBadge(mockInsights.sentiment)}
                </div>
                
                {mockInsights.tags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Tags:</div>
                    <div className="flex flex-wrap gap-1">
                      {mockInsights.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações de Custo */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Custo Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Tokens usados: ~2.4k</div>
              <div>Custo: ~$0.007</div>
              <div>Limite diário: $0.50</div>
            </div>
          </CardContent>
        </Card>

        {/* Última Atualização */}
        {mockInsights.lastUpdated && (
          <div className="text-xs text-muted-foreground text-center">
            Última atualização: {new Date(mockInsights.lastUpdated).toLocaleTimeString('pt-BR')}
          </div>
        )}
      </div>
    </div>
  );
}

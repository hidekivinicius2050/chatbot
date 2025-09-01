'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  FileText,
  Tag,
  Calendar,
  User
} from 'lucide-react';

// Mock data para demonstração
const mockKnowledgeBases = [
  {
    id: 'kb-1',
    name: 'Base de Conhecimento Padrão',
    description: 'FAQ e informações básicas da empresa',
    articleCount: 5,
    isDefault: true,
    updatedAt: '2024-12-19T10:00:00Z',
  },
  {
    id: 'kb-2',
    name: 'Suporte Técnico',
    description: 'Soluções para problemas técnicos comuns',
    articleCount: 12,
    isDefault: false,
    updatedAt: '2024-12-18T15:30:00Z',
  },
];

const mockArticles = [
  {
    id: 'article-1',
    title: 'Como funciona o atendimento?',
    status: 'published',
    tags: ['atendimento', 'processo', 'horários'],
    updatedAt: '2024-12-19T10:00:00Z',
    author: 'Admin',
  },
  {
    id: 'article-2',
    title: 'Política de Trocas e Devoluções',
    status: 'published',
    tags: ['trocas', 'devoluções', 'política'],
    updatedAt: '2024-12-18T14:20:00Z',
    author: 'Admin',
  },
  {
    id: 'article-3',
    title: 'Horários de Atendimento',
    status: 'published',
    tags: ['horários', 'feriados', 'emergências'],
    updatedAt: '2024-12-17T09:15:00Z',
    author: 'Admin',
  },
  {
    id: 'article-4',
    title: 'FAQ - Perguntas Frequentes',
    status: 'draft',
    tags: ['faq', 'produtos', 'atendimento'],
    updatedAt: '2024-12-16T16:45:00Z',
    author: 'Agente',
  },
];

export default function KnowledgeBasePage() {
  const t = useTranslations('knowledge');
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReindexing, setIsReindexing] = useState(false);

  const handleReindex = async (kbId: string) => {
    setIsReindexing(true);
    try {
      // Simular reindexação
      await new Promise(resolve => setTimeout(resolve, 3000));
      // TODO: Implementar reindexação real
    } catch (error) {
      console.error('Erro na reindexação:', error);
    } finally {
      setIsReindexing(false);
    }
  };

  const filteredArticles = mockArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status === 'published' ? 'Publicado' : 
         status === 'draft' ? 'Rascunho' : 'Arquivado'}
      </Badge>
    );
  };

  if (!selectedKB) {
    // Lista de Knowledge Bases
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-violet-500" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Base de Conhecimento</h1>
              <p className="text-muted-foreground">
                Gerencie artigos e informações para o atendimento
              </p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Base de Conhecimento
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockKnowledgeBases.map((kb) => (
            <Card 
              key={kb.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedKB(kb.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {kb.name}
                      {kb.isDefault && (
                        <Badge variant="secondary" className="text-xs">Padrão</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {kb.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {kb.articleCount} artigos
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(kb.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Lista de Artigos da KB selecionada
  const currentKB = mockKnowledgeBases.find(kb => kb.id === selectedKB);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedKB(null)}
          >
            ← Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentKB?.name}</h1>
            <p className="text-muted-foreground">
              {currentKB?.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => handleReindex(selectedKB)}
            disabled={isReindexing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isReindexing ? 'animate-spin' : ''}`} />
            {isReindexing ? 'Reindexando...' : 'Reindexar'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Artigo
          </Button>
        </div>
      </div>

      {/* Barra de Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar artigos por título ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Artigos */}
      <Card>
        <CardHeader>
          <CardTitle>Artigos ({filteredArticles.length})</CardTitle>
          <CardDescription>
            Gerencie o conteúdo da base de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(article.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </TableCell>
                  <TableCell>
                    {new Date(article.updatedAt).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

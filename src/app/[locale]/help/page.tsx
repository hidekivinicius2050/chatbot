"use client";

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search, BookOpen, MessageCircle, Settings, Users, BarChart3, Zap } from 'lucide-react';

// Artigos do Help Center
const helpArticles = [
  {
    id: 'atendimento-tickets',
    title: 'Atendimento e Tickets',
    description: 'Como gerenciar tickets e atender clientes',
    category: 'Core',
    icon: MessageCircle,
    path: '/help/atendimento-tickets'
  },
  {
    id: 'canais-whatsapp',
    title: 'Canais WhatsApp',
    description: 'Configurar WhatsApp Cloud e Baileys',
    category: 'Canais',
    icon: MessageCircle,
    path: '/help/canais-whatsapp'
  },
  {
    id: 'gestao-equipes',
    title: 'Gestão de Equipes',
    description: 'Organizar usuários e permissões',
    category: 'Administração',
    icon: Users,
    path: '/help/gestao-equipes'
  },
  {
    id: 'automacoes',
    title: 'Automações',
    description: 'Criar fluxos automáticos de atendimento',
    category: 'Automação',
    icon: Zap,
    path: '/help/automacoes'
  },
  {
    id: 'relatorios',
    title: 'Relatórios e Métricas',
    description: 'Analisar performance e resultados',
    category: 'Analytics',
    icon: BarChart3,
    path: '/help/relatorios'
  },
  {
    id: 'configuracoes',
    title: 'Configurações',
    description: 'Personalizar sistema e integrações',
    category: 'Administração',
    icon: Settings,
    path: '/help/configuracoes'
  }
];

const categories = ['Todos', 'Core', 'Canais', 'Administração', 'Automação', 'Analytics'];

export default function HelpCenterPage() {
  const t = useTranslations('help');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredArticles = useMemo(() => {
    let filtered = helpArticles;

    // Filtrar por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term) ||
        article.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Centro de Ajuda
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Encontre respostas para suas dúvidas e aprenda a usar todas as funcionalidades do Chatbot
        </p>
      </div>

      {/* Busca */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por tópicos, funcionalidades ou problemas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Filtros de Categoria */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Resultados da Busca */}
      {searchTerm && (
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">
            {filteredArticles.length} resultado{filteredArticles.length !== 1 ? 's' : ''} para "{searchTerm}"
          </p>
        </div>
      )}

      {/* Lista de Artigos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => {
          const IconComponent = article.icon;
          return (
            <div
              key={article.id}
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => window.open(article.path, '_blank')}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {article.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      Ler mais →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sem Resultados */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-muted-foreground mb-6">
            Tente ajustar sua busca ou categoria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todos');
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Seção de Contato */}
      <div className="mt-16 text-center">
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Nossa equipe de suporte está sempre pronta para ajudar. Entre em contato conosco para obter assistência personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Abrir Ticket de Suporte
            </button>
            <button className="px-6 py-3 border border-border bg-background text-foreground rounded-lg hover:bg-muted transition-colors">
              Falar com Especialista
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

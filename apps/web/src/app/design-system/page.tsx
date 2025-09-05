'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HeroSection } from '@/components/ui/hero-section'
import { DashboardCard, MetricCard, RevenueCard, UsersCard, AlertCard } from '@/components/ui/dashboard-card'

export default function DesignSystemPage() {
  const [loading, setLoading] = useState(false)

  const handlePrimaryAction = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
             {/* Hero Section */}
       <HeroSection
         title="Chatbot 2.0"
         subtitle="Sistema de Chat Empresarial Profissional"
         description="Plataforma completa de chatbot com WhatsApp, campanhas automáticas e inteligência artificial para empresas que querem revolucionar o atendimento ao cliente."
         primaryAction={{
           label: "Começar Agora",
           onClick: handlePrimaryAction,
           loading: loading
         }}
         secondaryAction={{
           label: "Ver Demo",
           onClick: () => console.log("Demo clicked")
         }}
       />

      {/* Design System Showcase */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
                     <h2 className="text-headline text-white mb-4">
             Design System Profissional
           </h2>
           <p className="text-body text-gray-300 max-w-2xl mx-auto">
             Sistema de design moderno e elegante com paleta de cores preto, azul e verde, 
             criado para aplicações empresariais de alta qualidade.
           </p>
        </div>

        {/* Buttons Section */}
        <section className="mb-20">
          <h3 className="text-title text-white mb-8 text-center">Componentes de Botão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="glass" className="text-center">
              <CardHeader>
                <CardTitle>Botões Primários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="default" size="default" className="w-full">
                  Botão Padrão
                </Button>
                <Button variant="brand" size="default" className="w-full">
                  Botão Marca
                </Button>
                <Button variant="success" size="default" className="w-full">
                  Botão Sucesso
                </Button>
              </CardContent>
            </Card>

            <Card variant="glass" className="text-center">
              <CardHeader>
                <CardTitle>Botões Secundários</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" size="default" className="w-full">
                  Botão Outline
                </Button>
                <Button variant="secondary" size="default" className="w-full">
                  Botão Secundário
                </Button>
                <Button variant="ghost" size="default" className="w-full">
                  Botão Ghost
                </Button>
              </CardContent>
            </Card>

            <Card variant="glass" className="text-center">
              <CardHeader>
                <CardTitle>Tamanhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="brand" size="sm" className="w-full">
                  Pequeno
                </Button>
                <Button variant="brand" size="default" className="w-full">
                  Padrão
                </Button>
                <Button variant="brand" size="lg" className="w-full">
                  Grande
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-20">
          <h3 className="text-title text-white mb-8 text-center">Componentes de Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Card Padrão</CardTitle>
                <CardDescription>
                  Card com design padrão e efeitos de hover
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Este é um exemplo de card padrão com todas as funcionalidades.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Card Glass</CardTitle>
                <CardDescription>
                  Card com efeito glassmorphism
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Card com efeito de vidro e backdrop blur.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Card Elevado</CardTitle>
                <CardDescription>
                  Card com efeitos de elevação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Card com animações de hover e escala.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Dashboard Cards Section */}
        <section className="mb-20">
          <h3 className="text-title text-white mb-8 text-center">Cards de Dashboard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Usuários"
              value="12,847"
              change={{ value: 12, isPositive: true, period: "mês passado" }}
              trend="up"
              icon="👥"
            />
            
            <RevenueCard
              title="Receita Mensal"
              value="R$ 45,230"
              change={{ value: 8, isPositive: true, period: "mês passado" }}
              trend="up"
            />
            
            <UsersCard
              title="Novos Usuários"
              value="1,234"
              change={{ value: 5, isPositive: false, period: "mês passado" }}
              trend="down"
            />
            
            <AlertCard
              title="Tickets Pendentes"
              value="23"
              change={{ value: 15, isPositive: false, period: "mês passado" }}
              trend="up"
            />
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-20">
          <h3 className="text-title text-white mb-8 text-center">Componentes de Input</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Input Padrão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Digite seu nome" />
                <Input placeholder="Digite seu email" type="email" />
                <Input placeholder="Digite sua senha" type="password" />
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Input Glass</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input variant="glass" placeholder="Input com efeito glass" />
                <Input variant="glass" placeholder="Outro input glass" />
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Tamanhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input size="sm" placeholder="Input pequeno" />
                <Input size="default" placeholder="Input padrão" />
                <Input size="lg" placeholder="Input grande" />
              </CardContent>
            </Card>
          </div>
        </section>

                 {/* Color Palette Section */}
         <section className="mb-20">
           <h3 className="text-title text-white mb-8 text-center">Paleta de Cores Profissional</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
             <div className="text-center">
               <div className="w-20 h-20 bg-[#0F0F0F] border border-gray-600 rounded-lg mx-auto mb-2"></div>
               <p className="text-white font-medium">Preto Principal</p>
               <p className="text-gray-400 text-sm">#0F0F0F</p>
             </div>
             
             <div className="text-center">
               <div className="w-20 h-20 bg-[#1F2937] border border-gray-600 rounded-lg mx-auto mb-2"></div>
               <p className="text-white font-medium">Preto Secundário</p>
               <p className="text-gray-400 text-sm">#1F2937</p>
             </div>
             
             <div className="text-center">
               <div className="w-20 h-20 bg-[#2563EB] border border-gray-600 rounded-lg mx-auto mb-2"></div>
               <p className="text-white font-medium">Azul Principal</p>
               <p className="text-gray-400 text-sm">#2563EB</p>
             </div>
             
             <div className="text-center">
               <div className="w-20 h-20 bg-[#10B981] border border-gray-600 rounded-lg mx-auto mb-2"></div>
               <p className="text-white font-medium">Verde Sucesso</p>
               <p className="text-gray-400 text-sm">#10B981</p>
             </div>
             
             <div className="text-center">
               <div className="w-20 h-20 bg-[#F59E0B] border border-gray-600 rounded-lg mx-auto mb-2"></div>
               <p className="text-white font-medium">Laranja Aviso</p>
               <p className="text-gray-400 text-sm">#F59E0B</p>
             </div>
           </div>
         </section>

        {/* Typography Section */}
        <section className="mb-20">
          <h3 className="text-title text-white mb-8 text-center">Tipografia</h3>
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-display mb-2">Display Text</h1>
              <p className="text-gray-400">Classe: text-display</p>
            </div>
            
            <div className="text-center">
              <h2 className="text-headline mb-2">Headline Text</h2>
              <p className="text-gray-400">Classe: text-headline</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-title mb-2">Title Text</h3>
              <p className="text-gray-400">Classe: text-title</p>
            </div>
            
            <div className="text-center">
              <p className="text-body mb-2">Body Text - Este é um exemplo de texto corpo com tamanho padrão e cor secundária.</p>
              <p className="text-gray-400">Classe: text-body</p>
            </div>
            
            <div className="text-center">
              <p className="text-caption mb-2">Caption Text</p>
              <p className="text-gray-400">Classe: text-caption</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

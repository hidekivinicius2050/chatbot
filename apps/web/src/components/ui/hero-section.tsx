import React from 'react'
import { Button } from './button'
import { Card } from './card'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  primaryAction?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  features?: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = "Chatbot 2.0",
  subtitle = "Sistema de Chat Empresarial Profissional",
  description = "Plataforma completa de chatbot com WhatsApp, campanhas automáticas e inteligência artificial para empresas que querem revolucionar o atendimento ao cliente.",
  primaryAction,
  secondaryAction,
  features = [
    {
      icon: "📱",
      title: "WhatsApp Integrado",
      description: "Conexão direta com WhatsApp Business API"
    },
    {
      icon: "🎯",
      title: "Campanhas Inteligentes",
      description: "Automação completa de marketing digital"
    },
    {
      icon: "🤖",
      title: "IA Avançada",
      description: "Chatbot inteligente com aprendizado contínuo"
    }
  ]
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%232563eb%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Main Content */}
        <div className="text-center mb-20 fade-in">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium mb-6">
             🚀 Versão 2.0 Disponível
           </div>
          
          <h1 className="text-display mb-6 bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            {title}
          </h1>
          
          <h2 className="text-headline text-blue-300 mb-6">
            {subtitle}
          </h2>
          
          <p className="text-body max-w-3xl mx-auto mb-10 text-gray-300 leading-relaxed">
            {description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {primaryAction && (
              <Button
                size="lg"
                variant="brand"
                onClick={primaryAction.onClick}
                loading={primaryAction.loading}
                className="min-w-[200px]"
              >
                {primaryAction.label}
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                size="lg"
                variant="outline"
                onClick={secondaryAction.onClick}
                className="min-w-[200px]"
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="glass"
              className="text-center slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: "99.9%", label: "Uptime" },
            { number: "24/7", label: "Suporte" },
            { number: "10k+", label: "Usuários" },
            { number: "50+", label: "Integrações" }
          ].map((stat, index) => (
            <div key={index} className="text-center scale-in" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

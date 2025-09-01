"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccessibility } from '@/hooks/use-accessibility'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const t = useTranslations()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Hook de acessibilidade
  const { containerRef, announce } = useAccessibility({
    onEscape: () => {
      setEmail('')
      setPassword('')
      announce('Formulário limpo')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simular login
      await new Promise(resolve => setTimeout(resolve, 1000))
      announce('Login realizado com sucesso')
      // Redirecionar para dashboard
    } catch (error) {
      announce('Erro no login')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
    announce(showPassword ? 'Senha ocultada' : 'Senha visível')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Skip Link */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 z-50 bg-brand text-brand-foreground px-4 py-2 rounded-md shadow-lg"
        >
          {t('accessibility.skipToContent')}
        </a>

        <Card className="shadow-midnight-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-brand" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Bem-vindo ao AtendeChat
            </CardTitle>
            <p className="text-muted-foreground">
              Faça login para acessar sua conta
            </p>
          </CardHeader>
          
          <CardContent>
            <form 
              ref={containerRef}
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="Formulário de login"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    aria-describedby="email-help"
                    aria-invalid={email && !email.includes('@')}
                  />
                </div>
                <p id="email-help" className="text-xs text-muted-foreground">
                  Digite seu endereço de e-mail
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    aria-describedby="password-help"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p id="password-help" className="text-xs text-muted-foreground">
                  Digite sua senha
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-border"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Lembrar de mim
                  </Label>
                </div>
                <Link 
                  href="/forgot-password"
                  className="text-sm text-brand hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link 
                  href="/register"
                  className="text-brand hover:underline font-medium"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 AtendeChat. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

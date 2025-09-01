"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAccessibility } from '@/hooks/use-accessibility'
import { Eye, EyeOff, Lock, Mail, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const t = useTranslations()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Hook de acessibilidade
  const { containerRef, announce } = useAccessibility({
    onEscape: () => {
      if (step > 1) {
        setStep(step - 1)
        announce(`Voltou para o passo ${step - 1}`)
      }
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
      announce(`Passo ${step + 1} de 3`)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
      announce(`Passo ${step - 1} de 3`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simular registro
      await new Promise(resolve => setTimeout(resolve, 2000))
      announce('Conta criada com sucesso!')
      // Redirecionar para dashboard
    } catch (error) {
      announce('Erro ao criar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.password && formData.password === formData.confirmPassword
      case 2:
        return formData.company
      case 3:
        return true
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nome completo
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="pl-10"
            required
            aria-describedby="name-help"
          />
        </div>
        <p id="name-help" className="text-xs text-muted-foreground">
          Digite seu nome completo
        </p>
      </div>

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
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="pl-10"
            required
            aria-describedby="email-help"
            aria-invalid={formData.email && !formData.email.includes('@')}
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
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="pl-10 pr-10"
            required
            aria-describedby="password-help"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p id="password-help" className="text-xs text-muted-foreground">
          Mínimo 8 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="pl-10 pr-10"
            required
            aria-describedby="confirm-password-help"
            aria-invalid={formData.confirmPassword && formData.password !== formData.confirmPassword}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <p id="confirm-password-help" className="text-xs text-muted-foreground">
          Digite a mesma senha novamente
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company" className="text-sm font-medium">
          Nome da empresa
        </Label>
        <Input
          id="company"
          type="text"
          placeholder="Nome da sua empresa"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          required
          aria-describedby="company-help"
        />
        <p id="company-help" className="text-xs text-muted-foreground">
          Digite o nome da sua empresa ou organização
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          Telefone (opcional)
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(11) 99999-9999"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          aria-describedby="phone-help"
        />
        <p id="phone-help" className="text-xs text-muted-foreground">
          Telefone para contato
        </p>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-success" />
      </div>
      <h3 className="text-lg font-medium">Quase pronto!</h3>
      <p className="text-muted-foreground">
        Revise suas informações antes de criar sua conta
      </p>
      
      <div className="text-left space-y-2 p-4 bg-muted/20 rounded-lg">
        <p><strong>Nome:</strong> {formData.name}</p>
        <p><strong>E-mail:</strong> {formData.email}</p>
        <p><strong>Empresa:</strong> {formData.company}</p>
        {formData.phone && <p><strong>Telefone:</strong> {formData.phone}</p>}
      </div>
    </div>
  )

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
              <User className="h-6 w-6 text-brand" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Criar conta
            </CardTitle>
            <p className="text-muted-foreground">
              Passo {step} de 3
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-brand h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            <form 
              ref={containerRef}
              onSubmit={handleSubmit}
              className="space-y-6"
              aria-label="Formulário de registro"
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  Anterior
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid()}
                  >
                    Próximo
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    disabled={!isStepValid() || isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link 
                  href="/login"
                  className="text-brand hover:underline font-medium"
                >
                  Faça login
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

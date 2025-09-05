"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '@/services/auth'

interface User {
  id: string
  email: string
  name: string
  role: string
  companyId: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearMockData: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar usuário atual ao carregar
    const currentUser = AuthService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await AuthService.login({ email, password })
      setUser(response.user)
      console.log('✅ Login bem-sucedido:', response.user)
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      throw error
    }
  }

  const logout = async () => {
    await AuthService.logout()
    setUser(null)
    console.log('✅ Logout realizado')
  }

  const clearMockData = () => {
    AuthService.clearMockData()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    clearMockData,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}


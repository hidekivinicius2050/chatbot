"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"
import { 
  Users, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  LogOut,
  User,
  Building,
  Shield
} from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Shell } from "@/components/layout/shell"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme } = useTheme()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getRoleDisplayName = (role: string) => {
    const roles: { [key: string]: string } = {
      'owner': 'Proprietário',
      'admin': 'Administrador',
      'agent': 'Atendente',
      'viewer': 'Visualizador'
    }
    return roles[role] || role
  }

  return (
    <ProtectedRoute>
      <Shell>
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className={cn(
              "text-3xl font-bold mb-2 transition-colors duration-200",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Bem-vindo, {user?.name}! 👋
            </h2>
            <p className="text-blue-600 transition-colors duration-200">
              Gerencie seu sistema de atendimento ao cliente
            </p>
          </div>

          {/* User Info Card */}
          <div className={cn(
            "border rounded-lg p-6 mb-8 transition-colors duration-200",
            theme === 'dark'
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          )}>
            <h3 className={cn(
              "text-xl font-semibold mb-4 flex items-center gap-2 transition-colors duration-200",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              <User className="h-5 w-5 text-blue-600" />
              Informações do Usuário
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
                theme === 'dark' ? "bg-gray-800" : "bg-gray-100"
              )}>
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {user?.name}
                  </p>
                  <p className={cn(
                    "text-xs transition-colors duration-200",
                    theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )}>
                    Nome
                  </p>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
                theme === 'dark' ? "bg-gray-800" : "bg-gray-100"
              )}>
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {getRoleDisplayName(user?.role || '')}
                  </p>
                  <p className={cn(
                    "text-xs transition-colors duration-200",
                    theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )}>
                    Função
                  </p>
                </div>
              </div>
              
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200",
                theme === 'dark' ? "bg-gray-800" : "bg-gray-100"
              )}>
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    Empresa #{user?.companyId}
                  </p>
                  <p className={cn(
                    "text-xs transition-colors duration-200",
                    theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )}>
                    ID da Empresa
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={cn(
              "border rounded-lg p-6 hover:border-blue-500 transition-all duration-200 cursor-pointer",
              theme === 'dark'
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Usuários</p>
                  <p className={cn(
                    "text-2xl font-bold transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    0
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className={cn(
              "border rounded-lg p-6 hover:border-green-500 transition-all duration-200 cursor-pointer",
              theme === 'dark'
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Chats Ativos</p>
                  <p className={cn(
                    "text-2xl font-bold transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    0
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className={cn(
              "border rounded-lg p-6 hover:border-orange-500 transition-all duration-200 cursor-pointer",
              theme === 'dark'
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Tickets</p>
                  <p className={cn(
                    "text-2xl font-bold transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    0
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className={cn(
              "border rounded-lg p-6 hover:border-blue-500 transition-all duration-200 cursor-pointer",
              theme === 'dark'
                ? "bg-gray-900 border-gray-700"
                : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Configurações</p>
                  <p className={cn(
                    "text-2xl font-bold transition-colors duration-200",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    -
                  </p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={cn(
            "border rounded-lg p-6 transition-colors duration-200",
            theme === 'dark'
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          )}>
            <h3 className={cn(
              "text-xl font-semibold mb-4 transition-colors duration-200",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Atividade Recente
            </h3>
            <div className={cn(
              "text-center py-8 transition-colors duration-200",
              theme === 'dark' ? "text-gray-400" : "text-gray-500"
            )}>
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-blue-600 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-sm">As atividades aparecerão aqui quando você começar a usar o sistema</p>
            </div>
          </div>
        </div>
      </Shell>
    </ProtectedRoute>
  )
}

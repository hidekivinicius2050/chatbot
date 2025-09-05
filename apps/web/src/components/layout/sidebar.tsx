"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/ThemeContext"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Megaphone, 
  Hash, 
  BarChart3, 
  Settings,
  X,
  Wifi,
  WifiOff,
  Zap,
  FileText,
  Bot,
  Workflow
} from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: MessageSquare },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Fluxos", href: "/flows", icon: Zap },
  { name: "Campanhas", href: "/campaigns", icon: Megaphone },
  { name: "Canais", href: "/channels", icon: Hash },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "N8N Workflows", href: "/n8n", icon: Workflow },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "IA & WhatsApp", href: "/ai-config", icon: Bot },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [wsStatus, setWsStatus] = useState<"online" | "offline" | "error">("online")

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-all duration-300 lg:translate-x-0",
          theme === 'dark'
            ? "bg-gray-900 border-r border-gray-700"
            : "bg-white border-r border-gray-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center justify-between px-6 border-b transition-colors duration-200",
          theme === 'dark' ? "border-gray-700" : "border-gray-200"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className={cn(
              "font-semibold text-lg transition-colors duration-200",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Chatbot
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className={cn(
              "lg:hidden transition-colors duration-200",
              theme === 'dark'
                ? "text-white hover:bg-gray-800 hover:text-blue-400"
                : "text-gray-900 hover:bg-gray-100 hover:text-blue-600"
            )}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600/20 text-blue-600 border border-blue-600/30"
                    : theme === 'dark'
                      ? "text-gray-300 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
                onClick={() => onOpenChange(false)}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  isActive 
                    ? "text-blue-600" 
                    : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t transition-colors duration-200",
          theme === 'dark' ? "border-gray-700" : "border-gray-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                wsStatus === "online" && "bg-green-500",
                wsStatus === "offline" && "bg-gray-500",
                wsStatus === "error" && "bg-red-500"
              )} />
              <span className={cn(
                "text-sm transition-colors duration-200",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )}>
                {wsStatus === "online" && "Conectado"}
                {wsStatus === "offline" && "Desconectado"}
                {wsStatus === "error" && "Erro"}
              </span>
            </div>
            
            <Badge variant={wsStatus === "online" ? "online" : "offline"}>
              {wsStatus === "online" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            </Badge>
          </div>
        </div>
      </div>
    </>
  )
}

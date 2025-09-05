"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/ThemeContext"
import { 
  Menu, 
  Search, 
  User,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react'
import { NotificationBell } from '@/components/ui/notifications'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + array.slice(0, index + 1).join("/"),
      isLast: index === array.length - 1,
    }))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement global search
    console.log("Search:", searchQuery)
  }

  return (
    <header 
      className={cn(
        "h-16 border-b px-6 flex items-center justify-between transition-colors duration-200",
        theme === 'dark' 
          ? "border-gray-700 bg-gray-900" 
          : "border-gray-200 bg-white"
      )}
      role="banner"
      aria-label="Barra superior de navegação"
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className={cn(
            "transition-colors duration-200",
            theme === 'dark'
              ? "text-white hover:bg-gray-800 hover:text-blue-400"
              : "text-gray-900 hover:bg-gray-100 hover:text-blue-600"
          )}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav 
          className="hidden md:flex items-center gap-2 text-sm"
          aria-label="Navegação por migalhas"
        >
          <span className={cn(
            theme === 'dark' ? "text-blue-400" : "text-blue-600"
          )}>
            Chatbot
          </span>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className={cn(
                "h-4 w-4",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )} aria-hidden="true" />
              <span className={cn(
                crumb.isLast 
                  ? (theme === 'dark' ? "text-white font-medium" : "text-gray-900 font-medium")
                  : (theme === 'dark' ? "text-gray-400" : "text-gray-500")
              )}>
                {crumb.name}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
            theme === 'dark' ? "text-gray-400" : "text-gray-500"
          )} aria-hidden="true" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 pr-4 transition-colors duration-200",
              theme === 'dark'
                ? "bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
            )}
            aria-label="Buscar"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className={cn(
              "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium transition-colors duration-200",
              theme === 'dark'
                ? "bg-gray-700 text-gray-300 border-gray-600"
                : "bg-gray-100 text-gray-600 border-gray-300"
            )}>
              <span className="text-xs">/</span>
            </kbd>
          </div>
        </form>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className={cn(
            "transition-colors duration-200",
            theme === 'dark'
              ? "text-white hover:bg-gray-800 hover:text-blue-400"
              : "text-gray-900 hover:bg-gray-100 hover:text-blue-600"
          )}
          aria-label="Alternar tema"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User menu */}
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "transition-colors duration-200",
            theme === 'dark'
              ? "text-white hover:bg-gray-800 hover:text-blue-400"
              : "text-gray-900 hover:bg-gray-100 hover:text-blue-600"
          )}
          aria-label="Menu do usuário"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

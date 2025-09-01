"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useI18n } from "@/hooks/use-i18n"
import { 
  Menu, 
  Search, 
  Bell, 
  User,
  Moon,
  Sun,
  ChevronRight
} from "lucide-react"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [theme, setTheme] = useState<"light" | "dark">("dark")
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
    document.documentElement.classList.toggle("dark")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement global search
    console.log("Search:", searchQuery)
  }

  return (
    <header 
      className="h-16 border-b border-border bg-card px-6 flex items-center justify-between"
      role="banner"
      aria-label="Barra superior de navegação"
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label={t('accessibility.openMenu')}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav 
          className="hidden md:flex items-center gap-2 text-sm"
          aria-label="Navegação por migalhas"
        >
          <span className="text-muted-foreground">AtendeChat</span>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className={cn(
                crumb.isLast ? "text-foreground font-medium" : "text-muted-foreground"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
            aria-label={t('common.search')}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">/</span>
            </kbd>
          </div>
        </form>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            aria-label="3 notificações não lidas"
          >
            3
          </Badge>
        </Button>

        {/* Theme toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          aria-label={t('accessibility.toggleTheme')}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* User menu */}
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Menu do usuário"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

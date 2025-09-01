"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboard, 
  MessageSquare, 
  Megaphone, 
  Hash, 
  BarChart3, 
  Settings,
  X,
  Wifi,
  WifiOff
} from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tickets", href: "/tickets", icon: MessageSquare },
  { name: "Campanhas", href: "/campanhas", icon: Megaphone },
  { name: "Canais", href: "/canais", icon: Hash },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
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
          "fixed inset-y-0 left-0 z-50 w-70 flex flex-col bg-card border-r border-border transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-semibold text-headline">AtendeChat</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="lg:hidden"
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-base font-medium transition-smooth",
                  isActive
                    ? "bg-brand/20 text-brand"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                onClick={() => onOpenChange(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                wsStatus === "online" && "bg-success",
                wsStatus === "offline" && "bg-muted-foreground",
                wsStatus === "error" && "bg-destructive"
              )} />
              <span className="text-sm text-muted-foreground">
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

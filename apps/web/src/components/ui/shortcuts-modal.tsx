"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Keyboard,
  Search,
  LayoutDashboard,
  MessageSquare,
  Settings,
  HelpCircle
} from "lucide-react"

interface ShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const shortcuts = [
  {
    key: "/",
    description: "Busca global",
    icon: Search,
  },
  {
    key: "g d",
    description: "Ir para Dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "g t",
    description: "Ir para Tickets",
    icon: MessageSquare,
  },
  {
    key: "g s",
    description: "Ir para Configurações",
    icon: Settings,
  },
  {
    key: "?",
    description: "Mostrar atalhos",
    icon: HelpCircle,
  },
  {
    key: "Escape",
    description: "Fechar modal/dialog",
    icon: Keyboard,
  },
]

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onOpenChange])

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-brand" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Use estes atalhos para navegar mais rapidamente pela aplicação.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/20"
              >
                <div className="w-10 h-10 bg-brand/20 rounded-xl flex items-center justify-center">
                  <shortcut.icon className="h-5 w-5 text-brand" />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-foreground">{shortcut.description}</p>
                  <Badge variant="outline" className="mt-1">
                    {shortcut.key}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Pressione <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd> a qualquer momento para ver este modal
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

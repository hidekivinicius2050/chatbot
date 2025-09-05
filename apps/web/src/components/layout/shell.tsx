"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { useTheme } from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme()

  return (
    <div className={cn(
      "flex h-screen transition-colors duration-200",
      theme === 'dark' ? "bg-gray-950" : "bg-gray-50"
    )}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        {/* Topbar */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-colors duration-200",
          theme === 'dark' ? "bg-gray-950" : "bg-gray-50"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}

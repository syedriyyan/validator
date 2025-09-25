"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ApiStatusIndicator } from "@/components/api-status-indicator"
import { Home, Upload, History, BarChart3, Mail, Shield, Zap } from "lucide-react"

const navigation = [
  { name: "Validate", href: "/", icon: Home },
  { name: "Bulk Upload", href: "/upload", icon: Upload },
  { name: "History", href: "/history", icon: History },
  { name: "Analytics", href: "/dashboard", icon: BarChart3 },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">EmailValidator</h1>
            <p className="text-xs text-muted-foreground">Pro Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3 h-10", isActive && "bg-secondary text-secondary-foreground")}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="flex justify-center">
          <ApiStatusIndicator />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Fraud Detection</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>Real-time Validation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

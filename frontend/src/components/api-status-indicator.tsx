"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { EmailValidatorAPI } from "@/lib/api"
import { Wifi, WifiOff, Clock } from "lucide-react"

export function ApiStatusIndicator() {
  const [status, setStatus] = useState<"online" | "offline" | "checking">("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await EmailValidatorAPI.healthCheck()
        setStatus("online")
        setLastChecked(new Date())
      } catch (error) {
        setStatus("offline")
        setLastChecked(new Date())
      }
    }

    // Initial check
    checkApiStatus()

    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    switch (status) {
      case "online":
        return {
          icon: Wifi,
          text: "API Online",
          className: "bg-green-500/10 text-green-500 border-green-500/20",
        }
      case "offline":
        return {
          icon: WifiOff,
          text: "API Offline",
          className: "bg-red-500/10 text-red-500 border-red-500/20",
        }
      case "checking":
        return {
          icon: Clock,
          text: "Checking...",
          className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge className={`flex items-center gap-1.5 px-2.5 py-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  )
}

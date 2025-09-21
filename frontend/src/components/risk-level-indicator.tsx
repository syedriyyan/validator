import { Badge } from "@/components/ui/badge"
import { Shield, ShieldAlert, ShieldX } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskLevelIndicatorProps {
  level: "low" | "medium" | "high"
  className?: string
}

export function RiskLevelIndicator({ level, className }: RiskLevelIndicatorProps) {
  const config = {
    low: {
      icon: Shield,
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      text: "Low Risk",
    },
    medium: {
      icon: ShieldAlert,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      text: "Medium Risk",
    },
    high: {
      icon: ShieldX,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      text: "High Risk",
    },
  }

  const { icon: Icon, className: riskClassName, text } = config[level]

  return (
    <Badge className={cn("flex items-center gap-1.5 px-2.5 py-1", riskClassName, className)}>
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  )
}

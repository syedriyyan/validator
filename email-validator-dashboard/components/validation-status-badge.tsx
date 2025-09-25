import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationStatusBadgeProps {
  status: "valid" | "invalid" | "pending" | "warning"
  text?: string
  className?: string
}

export function ValidationStatusBadge({ status, text, className }: ValidationStatusBadgeProps) {
  const config = {
    valid: {
      icon: CheckCircle,
      variant: "default" as const,
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      text: text || "Valid",
    },
    invalid: {
      icon: XCircle,
      variant: "destructive" as const,
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      text: text || "Invalid",
    },
    warning: {
      icon: AlertCircle,
      variant: "secondary" as const,
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      text: text || "Warning",
    },
    pending: {
      icon: Clock,
      variant: "outline" as const,
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      text: text || "Pending",
    },
  }

  const { icon: Icon, className: statusClassName, text: statusText } = config[status]

  return (
    <Badge className={cn("flex items-center gap-1.5 px-2.5 py-1", statusClassName, className)}>
      <Icon className="h-3 w-3" />
      {statusText}
    </Badge>
  )
}

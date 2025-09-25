import { toast } from "@/hooks/use-toast"

export function useToastNotifications() {
  const showSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    })
  }

  const showError = (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  }

  const showInfo = (message: string) => {
    toast({
      title: "Info",
      description: message,
    })
  }

  return { showSuccess, showError, showInfo }
}

export function useToastNotifications() {
  return {
    showError: (msg: string) => alert(msg),
    showSuccess: (msg: string) => alert(msg),
  }
}

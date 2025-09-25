export interface ValidationResult {
  email: string
  is_valid: boolean
  syntax_valid: boolean
  domain_valid: boolean
  smtp_valid: boolean | null
  risk_level: "low" | "medium" | "high"
  is_disposable: boolean
  is_role_based: boolean
  breach_status: boolean
  domain: string
  provider: string
}

export interface ValidationRequest {
  email: string
  check_smtp?: boolean
  check_disposable?: boolean
  check_breach?: boolean
}

export interface BulkValidationResult {
  batch_id: string
  total_emails: number
  processed: number
  valid_count: number
  invalid_count: number
  results: ValidationResult[]
  created_at: string
  filename: string
}

export interface EmailValidationRequest {
  email: string
  check_smtp?: boolean
}

export interface EmailValidationResponse {
  email: string
  status: string
  is_valid?: boolean
  syntax_valid?: boolean
  domain_valid?: boolean
  smtp_valid?: boolean | null
  risk_level?: "low" | "medium" | "high"
  is_disposable?: boolean
  is_role_based?: boolean
  breach_status?: boolean
  domain?: string
  provider?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class EmailValidatorAPI {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`

        try {
          const errorData = await response.json()
          if (errorData.detail) {
            errorMessage = errorData.detail
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // Use default error message if JSON parsing fails
        }

        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - please try again")
        }
        throw error
      }

      throw new Error("Network error - please check your connection")
    }
  }

  static async validateEmail(request: ValidationRequest): Promise<ValidationResult> {
    return this.request<ValidationResult>("/validate", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  static async validateEmailCompat(request: EmailValidationRequest): Promise<EmailValidationResponse> {
    return this.request<EmailValidationResponse>("/validate", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  static async bulkValidate(emails: string[]): Promise<{ batch_id: string }> {
    if (emails.length === 0) {
      throw new Error("No emails provided for validation")
    }

    if (emails.length > 10000) {
      throw new Error("Maximum 10,000 emails allowed per batch")
    }

    return this.request<{ batch_id: string }>("/validate/bulk", {
      method: "POST",
      body: JSON.stringify({ emails }),
    })
  }

  static async getBatchStatus(batchId: string): Promise<BulkValidationResult> {
    if (!batchId) {
      throw new Error("Batch ID is required")
    }

    return this.request<BulkValidationResult>(`/batch/${batchId}`)
  }

  static async getBatchHistory(): Promise<BulkValidationResult[]> {
    return this.request<BulkValidationResult[]>("/batch/history")
  }

  static async getAnalytics(): Promise<{
    total_processed: number
    valid_percentage: number
    invalid_percentage: number
    disposable_percentage: number
    role_based_percentage: number
    domain_distribution: Record<string, number>
    daily_volume: Array<{ date: string; count: number }>
  }> {
    return this.request("/analytics")
  }

  static async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request("/health")
  }
}

// Backward compatibility function
export async function validateEmail(request: EmailValidationRequest): Promise<EmailValidationResponse> {
  return EmailValidatorAPI.validateEmailCompat(request) as Promise<EmailValidationResponse>
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ValidationStatusBadge } from "@/components/validation-status-badge"
import { RiskLevelIndicator } from "@/components/risk-level-indicator"
import { EmailValidatorAPI, type ValidationResult } from "@/lib/api"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import { Mail, AlertTriangle, CheckCircle2 } from "lucide-react"

export function EmailValidationForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [options, setOptions] = useState({
    checkSmtp: true,
    checkDisposable: true,
    checkBreach: true,
  })
  const { showError } = useToastNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const validationResult = await EmailValidatorAPI.validateEmail({
        email: email.trim(),
        check_smtp: options.checkSmtp,
        check_disposable: options.checkDisposable,
        check_breach: options.checkBreach,
      })
      setResult(validationResult)
    } catch (error) {
      showError(error instanceof Error ? error.message : "Validation failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Validation
          </CardTitle>
          <CardDescription>
            Validate email addresses with comprehensive syntax, domain, and deliverability checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address to validate..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-base"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Validation Options</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smtp"
                    checked={options.checkSmtp}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, checkSmtp: checked as boolean }))}
                  />
                  <Label htmlFor="smtp" className="text-sm">
                    SMTP Verification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="disposable"
                    checked={options.checkDisposable}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, checkDisposable: checked as boolean }))
                    }
                  />
                  <Label htmlFor="disposable" className="text-sm">
                    Disposable Email Detection
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="breach"
                    checked={options.checkBreach}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, checkBreach: checked as boolean }))}
                  />
                  <Label htmlFor="breach" className="text-sm">
                    Breach Monitoring
                  </Label>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !email.trim()} className="w-full">
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Validating...
                </>
              ) : (
                "Validate Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-foreground">{result.email}</p>
                <p className="text-sm text-muted-foreground">
                  Provider: {result.provider} • Domain: {result.domain}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ValidationStatusBadge status={result.is_valid ? "valid" : "invalid"} />
                <RiskLevelIndicator level={result.risk_level} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Syntax</div>
                <ValidationStatusBadge status={result.syntax_valid ? "valid" : "invalid"} className="mt-1" />
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Domain</div>
                <ValidationStatusBadge status={result.domain_valid ? "valid" : "invalid"} className="mt-1" />
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">SMTP</div>
                <ValidationStatusBadge
                  status={result.smtp_valid === null ? "pending" : result.smtp_valid ? "valid" : "invalid"}
                  text={result.smtp_valid === null ? "Skipped" : undefined}
                  className="mt-1"
                />
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">Security</div>
                <ValidationStatusBadge
                  status={result.breach_status ? "warning" : "valid"}
                  text={result.breach_status ? "Breached" : "Clean"}
                  className="mt-1"
                />
              </div>
            </div>

            {(result.is_disposable || result.is_role_based) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div className="text-sm">
                  {result.is_disposable && "Disposable email detected. "}
                  {result.is_role_based && "Role-based email detected."}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ValidationStatusBadge } from "@/components/validation-status-badge"
import { RiskLevelIndicator } from "@/components/risk-level-indicator"
import { StatsCard } from "@/components/stats-card"
import { EmailValidatorAPI, type BulkValidationResult, type ValidationResult } from "@/lib/api"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import { Search, Download, FileText, CheckCircle, XCircle, AlertTriangle, Shield } from "lucide-react"
import { format } from "date-fns"

export default function ResultsPage() {
  const params = useParams()
  const batchId = params.batchId as string
  const [batch, setBatch] = useState<BulkValidationResult | null>(null)
  const [filteredResults, setFilteredResults] = useState<ValidationResult[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { showError, showSuccess } = useToastNotifications()

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const batchData = await EmailValidatorAPI.getBatchStatus(batchId)
        setBatch(batchData)
        setFilteredResults(batchData.results)
      } catch (error) {
        showError(error instanceof Error ? error.message : "Failed to load batch results")
      } finally {
        setIsLoading(false)
      }
    }

    if (batchId) {
      fetchBatch()
    }
  }, [batchId, showError])

  useEffect(() => {
    if (!batch) return

    let filtered = batch.results

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.domain.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((result) => {
        switch (statusFilter) {
          case "valid":
            return result.is_valid
          case "invalid":
            return !result.is_valid
          case "disposable":
            return result.is_disposable
          case "role-based":
            return result.is_role_based
          case "breached":
            return result.breach_status
          default:
            return true
        }
      })
    }

    // Apply risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter((result) => result.risk_level === riskFilter)
    }

    setFilteredResults(filtered)
  }, [batch, searchTerm, statusFilter, riskFilter])

  const handleExport = () => {
    if (!batch) return

    const validEmails = batch.results
      .filter((result) => result.is_valid)
      .map((result) => result.email)
      .join("\n")

    const blob = new Blob([validEmails], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `validated-emails-${batch.batch_id.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showSuccess(`Exported ${validEmails.split("\n").length} valid emails`)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!batch) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Batch not found</h3>
            <p className="text-muted-foreground">The requested validation batch could not be found.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const validPercentage = batch.total_emails > 0 ? (batch.valid_count / batch.total_emails) * 100 : 0
  const invalidPercentage = batch.total_emails > 0 ? (batch.invalid_count / batch.total_emails) * 100 : 0
  const disposableCount = batch.results.filter((r) => r.is_disposable).length
  const roleBasedCount = batch.results.filter((r) => r.is_role_based).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground text-balance">Validation Results</h1>
            <p className="text-muted-foreground text-pretty mt-2">
              Batch: {batch.filename} • {format(new Date(batch.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Valid Emails
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Processed"
            value={batch.total_emails}
            description={`${batch.processed} of ${batch.total_emails} completed`}
            icon={FileText}
          />
          <StatsCard
            title="Valid Emails"
            value={`${validPercentage.toFixed(1)}%`}
            description={`${batch.valid_count} valid addresses`}
            icon={CheckCircle}
          />
          <StatsCard
            title="Invalid Emails"
            value={`${invalidPercentage.toFixed(1)}%`}
            description={`${batch.invalid_count} invalid addresses`}
            icon={XCircle}
          />
          <StatsCard
            title="Risk Detected"
            value={disposableCount + roleBasedCount}
            description="Disposable & role-based emails"
            icon={Shield}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Results</CardTitle>
            <CardDescription>Detailed validation results for each email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails or domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid Only</SelectItem>
                  <SelectItem value="invalid">Invalid Only</SelectItem>
                  <SelectItem value="disposable">Disposable</SelectItem>
                  <SelectItem value="role-based">Role-based</SelectItem>
                  <SelectItem value="breached">Breached</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.slice(0, 100).map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{result.email}</TableCell>
                      <TableCell className="text-muted-foreground">{result.domain}</TableCell>
                      <TableCell>
                        <ValidationStatusBadge status={result.is_valid ? "valid" : "invalid"} />
                      </TableCell>
                      <TableCell>
                        <RiskLevelIndicator level={result.risk_level} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {result.is_disposable && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20"
                            >
                              Disposable
                            </Badge>
                          )}
                          {result.is_role_based && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20"
                            >
                              Role-based
                            </Badge>
                          )}
                          {result.breach_status && (
                            <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                              Breached
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredResults.length > 100 && (
                <div className="p-4 text-center text-muted-foreground border-t">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  Showing first 100 results. {filteredResults.length - 100} more results available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

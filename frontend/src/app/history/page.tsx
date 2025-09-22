"use client"

//jkfbvwjb

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingSpinner } from "@/components/loading-spinner"
import { EmailValidatorAPI, type BulkValidationResult } from "@/lib/api"
function useToastNotifications() {
  return {
    showError: (message: string) => {
      // Replace with your toast implementation, e.g. using a toast library or custom logic
      alert(message)
    }
  }
}
import Link from "next/link"
import { History, FileText, Calendar, TrendingUp, Eye } from "lucide-react"
import { format } from  "date-fns"

export default function HistoryPage() {
  const [batches, setBatches] = useState<BulkValidationResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToastNotifications()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await EmailValidatorAPI.getBatchHistory()
        setBatches(history)
      } catch (error) {
        showError(error instanceof Error ? error.message : "Failed to load history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [showError])

  const getStatusBadge = (batch: BulkValidationResult) => {
    const isComplete = batch.processed === batch.total_emails
    const validPercentage = batch.total_emails > 0 ? (batch.valid_count / batch.total_emails) * 100 : 0

    if (!isComplete) {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Processing
        </Badge>
      )
    }

    if (validPercentage >= 80) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Excellent
        </Badge>
      )
    } else if (validPercentage >= 60) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Good
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          Poor
        </Badge>
      )
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Validation History</h1>
          <p className="text-muted-foreground text-pretty mt-2">
            View and manage your previous email validation batches and results.
          </p>
        </div>

        {batches.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No validation history</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't run any bulk validations yet. Upload your first email list to get started.
              </p>
              <Link href="/upload">
                <Button>Start Validation</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Validation Batches
              </CardTitle>
              <CardDescription>{batches.length} validation batches found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Emails</TableHead>
                    <TableHead>Valid</TableHead>
                    <TableHead>Invalid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.batch_id}>
                      <TableCell className="font-mono text-sm">{batch.batch_id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{batch.filename}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(batch.created_at), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{batch.total_emails}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {batch.valid_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-red-600">{batch.invalid_count}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(batch)}</TableCell>
                      <TableCell>
                        <Link href={`/results/${batch.batch_id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

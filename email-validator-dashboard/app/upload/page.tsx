"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FileUploadZone } from "@/components/file-upload-zone"
import { EmailPreviewTable } from "@/components/email-preview-table"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailValidatorAPI } from "@/lib/api"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import { useRouter } from "next/navigation"
import { Upload, FileText, Zap } from "lucide-react"

export default function UploadPage() {
  const [emails, setEmails] = useState<string[]>([])
  const [filename, setFilename] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const { showSuccess, showError } = useToastNotifications()
  const router = useRouter()

  const handleFileSelect = (emailList: string[], fileName: string) => {
    setEmails(emailList)
    setFilename(fileName)
  }

  const handleStartValidation = async () => {
    if (emails.length === 0) return

    setIsValidating(true)
    try {
      const result = await EmailValidatorAPI.bulkValidate(emails)
      showSuccess(`Validation started! Batch ID: ${result.batch_id}`)
      router.push(`/results/${result.batch_id}`)
    } catch (error) {
      showError(error instanceof Error ? error.message : "Failed to start validation")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Bulk Email Validation</h1>
          <p className="text-muted-foreground text-pretty mt-2">
            Upload your email lists for comprehensive validation and fraud detection analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-4 w-4 text-primary" />
                Step 1: Upload
              </CardTitle>
              <CardDescription>Upload your CSV or TXT file containing email addresses</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Step 2: Preview
              </CardTitle>
              <CardDescription>Review and verify your email list before validation</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" />
                Step 3: Validate
              </CardTitle>
              <CardDescription>Start the validation process and monitor progress</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <FileUploadZone onFileSelect={handleFileSelect} />

        {emails.length > 0 && (
          <EmailPreviewTable
            emails={emails}
            filename={filename}
            onStartValidation={handleStartValidation}
            isValidating={isValidating}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

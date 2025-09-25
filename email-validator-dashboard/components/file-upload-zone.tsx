"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (emails: string[], filename: string) => void
  className?: string
}

export function FileUploadZone({ onFileSelect, className }: FileUploadZoneProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      try {
        const text = await file.text()
        const emails = text
          .split(/[\n,;]/)
          .map((email) => email.trim())
          .filter((email) => email && email.includes("@"))
          .filter((email, index, arr) => arr.indexOf(email) === index) // Remove duplicates

        onFileSelect(emails, file.name)
      } catch (error) {
        console.error("Error processing file:", error)
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileSelect],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setUploadedFile(file)
        processFile(file)
      }
    },
    [processFile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  })

  const removeFile = () => {
    setUploadedFile(null)
    onFileSelect([], "")
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? "Drop your file here" : "Upload Email List"}
            </h3>
            <p className="text-muted-foreground mb-4">Drag and drop your CSV or TXT file, or click to browse</p>
            <Button variant="outline">Choose File</Button>
            <p className="text-xs text-muted-foreground mt-4">Supported formats: .csv, .txt • Max file size: 10MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                  {isProcessing && " • Processing..."}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

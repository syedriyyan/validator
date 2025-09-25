"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Mail, AlertCircle } from "lucide-react"

interface EmailPreviewTableProps {
  emails: string[]
  filename: string
  onStartValidation: () => void
  isValidating?: boolean
}

export function EmailPreviewTable({
  emails,
  filename,
  onStartValidation,
  isValidating = false,
}: EmailPreviewTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEmails = emails.filter((email) => email.toLowerCase().includes(searchTerm.toLowerCase()))

  const getDomainStats = () => {
    const domains = emails.map((email) => email.split("@")[1])
    const domainCounts = domains.reduce(
      (acc, domain) => {
        acc[domain] = (acc[domain] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(domainCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  if (emails.length === 0) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Preview
          </CardTitle>
          <CardDescription>Review your uploaded emails before starting validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                {emails.length} emails loaded
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                From: {filename}
              </Badge>
            </div>
            <Button onClick={onStartValidation} disabled={isValidating}>
              {isValidating ? "Validating..." : "Start Validation"}
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Email List</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Email Address</TableHead>
                          <TableHead>Domain</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmails.slice(0, 100).map((email, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-muted-foreground">{emails.indexOf(email) + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{email}</TableCell>
                            <TableCell className="text-muted-foreground">{email.split("@")[1]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredEmails.length > 100 && (
                      <div className="p-4 text-center text-muted-foreground">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        Showing first 100 results. {filteredEmails.length - 100} more emails available.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Top Domains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getDomainStats().map(([domain, count]) => (
                      <div key={domain} className="flex items-center justify-between">
                        <span className="text-sm font-mono">{domain}</span>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

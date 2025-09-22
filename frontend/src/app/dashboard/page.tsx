"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/stats-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { EmailValidatorAPI } from "@/lib/api"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import { Mail, Shield, TrendingUp, AlertTriangle, BarChart3, PieChartIcon, Activity } from "lucide-react"

interface AnalyticsData {
  total_processed: number
  valid_percentage: number
  invalid_percentage: number
  disposable_percentage: number
  role_based_percentage: number
  domain_distribution: Record<string, number>
  daily_volume: Array<{ date: string; count: number }>
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showError } = useToastNotifications()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await EmailValidatorAPI.getAnalytics()
        setAnalytics(data)
      } catch (error) {
        showError(error instanceof Error ? error.message : "Failed to load analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [showError])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No analytics data</h3>
            <p className="text-muted-foreground">Start validating emails to see analytics and insights.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  // Prepare chart data
  const validationData = [
    { name: "Valid", value: analytics.valid_percentage, color: "#10b981" },
    { name: "Invalid", value: analytics.invalid_percentage, color: "#ef4444" },
  ]

  const riskData = [
    { name: "Clean", value: 100 - analytics.disposable_percentage - analytics.role_based_percentage, color: "#10b981" },
    { name: "Disposable", value: analytics.disposable_percentage, color: "#f59e0b" },
    { name: "Role-based", value: analytics.role_based_percentage, color: "#3b82f6" },
  ]

  const domainData = Object.entries(analytics.domain_distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }))

  const volumeData = analytics.daily_volume.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: item.count,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-pretty mt-2">
            Comprehensive insights and analytics for your email validation activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Processed"
            value={analytics.total_processed.toLocaleString()}
            description="Emails validated to date"
            icon={Mail}
          />
          <StatsCard
            title="Valid Rate"
            value={`${analytics.valid_percentage.toFixed(1)}%`}
            description="Successfully validated emails"
            icon={Shield}
            trend={{ value: 2.3, isPositive: true }}
          />
          <StatsCard
            title="Disposable Rate"
            value={`${analytics.disposable_percentage.toFixed(1)}%`}
            description="Temporary email addresses"
            icon={AlertTriangle}
            trend={{ value: -1.2, isPositive: true }}
          />
          <StatsCard
            title="Role-based Rate"
            value={`${analytics.role_based_percentage.toFixed(1)}%`}
            description="Generic business emails"
            icon={TrendingUp}
            trend={{ value: 0.8, isPositive: false }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Validation Results
              </CardTitle>
              <CardDescription>Distribution of valid vs invalid emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={validationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {validationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {validationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Risk Analysis
              </CardTitle>
              <CardDescription>Email risk categorization breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {riskData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: {item.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Validation Volume
              </CardTitle>
              <CardDescription>Daily email validation activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                    <YAxis className="text-muted-foreground" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Top Domains
              </CardTitle>
              <CardDescription>Most frequently validated domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {domainData.slice(0, 8).map((item, index) => (
                  <div key={item.domain} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <span className="font-mono text-sm">{item.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(item.count / domainData[0].count) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

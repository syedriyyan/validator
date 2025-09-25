import { DashboardLayout } from "@/components/dashboard-layout"
import { EmailValidationForm } from "@/components/email-validation-form"
import { StatsCard } from "@/components/stats-card"
import { Mail, Shield, Zap, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Email Validation Dashboard</h1>
          <p className="text-muted-foreground text-pretty mt-2">
            Validate email addresses with advanced fraud detection, deliverability checks, and comprehensive analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Validated"
            value="12,847"
            description="Emails processed this month"
            icon={Mail}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Valid Rate"
            value="87.3%"
            description="Successfully validated emails"
            icon={Shield}
            trend={{ value: 2.1, isPositive: true }}
          />
          <StatsCard
            title="Fraud Detected"
            value="156"
            description="High-risk emails blocked"
            icon={Zap}
            trend={{ value: -8.2, isPositive: true }}
          />
          <StatsCard
            title="API Calls"
            value="45,231"
            description="Requests processed today"
            icon={TrendingUp}
            trend={{ value: 18.7, isPositive: true }}
          />
        </div>

        <EmailValidationForm />
      </div>
    </DashboardLayout>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { validateEmail, type EmailValidationRequest, type EmailValidationResponse } from "@/lib/api"

export default function SimplePage() {
  const [email, setEmail] = useState("")
  const [result, setResult] = useState<EmailValidationResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const payload: EmailValidationRequest = {
      email,
      check_smtp: false,
    }

    try {
      const res = await validateEmail(payload)
      setResult(res)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <h1 className="text-3xl font-semibold mb-6 text-foreground">Email Validator</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md bg-card p-6 rounded-xl shadow space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full border border-border rounded-lg px-4 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
        >
          {loading ? "Validating..." : "Validate Email"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg shadow">
          <p>
            <strong>Email:</strong> {result.email}
          </p>
          <p>
            <strong>Status:</strong> {result.status}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg shadow">
          {error}
        </div>
      )}
    </main>
  )
}

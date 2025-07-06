"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { analyticsApi, type MonthlyExpense } from "@/lib/api"

const chartConfig = {
  totalExpenses: {
    label: "Expenses",
    color: "oklch(0.577 0.245 27.325)",
  },
}

export function MonthlyExpensesChart() {
  const [data, setData] = useState<MonthlyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMonthlyExpenses()
  }, [])

  const loadMonthlyExpenses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await analyticsApi.getMonthlyExpenses(6)
      if (response.success && response.data) {
        setData(response.data)
      } else {
        throw new Error(response.error || "Failed to load monthly expenses")
      }
    } catch (err) {
      console.error("Error loading monthly expenses:", err)
      setError(err instanceof Error ? err.message : "Failed to load monthly expenses")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No expense data available</div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="monthName" className="text-xs" tick={{ fontSize: 12 }} />
        <YAxis
          className="text-xs"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => [`$${Number(value).toLocaleString()}`, "Expenses"]} />}
        />
        <Bar
          dataKey="totalExpenses"
          fill="var(--color-totalExpenses)"
          radius={[4, 4, 0, 0]}
          className="hover:opacity-80"
        />
      </BarChart>
    </ChartContainer>
  )
}

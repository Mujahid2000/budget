"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { budgetApi, analyticsApi } from "@/lib/api"

const chartConfig = {
  budget: {
    label: "Budget",
    color: "oklch(0.488 0.243 264.376)",
  },
  actual: {
    label: "Actual",
    color: "oklch(0.577 0.245 27.325)",
  },
}

export function BudgetComparisonChart() {
  const [data, setData] = useState<Array<{ category: string; budget: number; actual: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadComparisonData()
  }, [])

  const loadComparisonData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current month data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

      const [budgetsResponse, categoryResponse] = await Promise.all([
        budgetApi.getAll(),
        analyticsApi.getCategoryBreakdown({
          startDate: startOfMonth,
          endDate: endOfMonth,
        }),
      ])

      if (!budgetsResponse.success || !categoryResponse.success) {
        throw new Error("Failed to load comparison data")
      }

      const budgets = budgetsResponse.data || []
      const categories = categoryResponse.data || []

      // Create comparison data
      const comparisonData = budgets.map((budget) => {
        const categoryData = categories.find((cat) => cat.category === budget.category)
        return {
          category: budget.category,
          budget: budget.amount,
          actual: categoryData?.totalAmount || 0,
        }
      })

      setData(comparisonData)
    } catch (err) {
      console.error("Error loading comparison data:", err)
      setError(err instanceof Error ? err.message : "Failed to load comparison data")
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
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No budget comparison data available
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="category"
          className="text-xs"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          className="text-xs"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()}`,
                name === "budget" ? "Budget" : "Actual",
              ]}
            />
          }
        />
        <Legend />
        <Bar dataKey="budget" fill="var(--color-budget)" name="Budget" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" fill="var(--color-actual)" name="Actual" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

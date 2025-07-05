"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { analyticsApi, type CategoryBreakdown } from "@/lib/api"

const COLORS = [
  "oklch(0.645 0.246 16.439)",
  "oklch(0.696 0.17 162.48)",
  "oklch(0.627 0.265 303.9)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.646 0.222 41.116)",
]

export function CategoryPieChart() {
  const [data, setData] = useState<CategoryBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCategoryBreakdown()
  }, [])

  const loadCategoryBreakdown = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current month data
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

      const response = await analyticsApi.getCategoryBreakdown({
        startDate: startOfMonth,
        endDate: endOfMonth,
      })

      if (response.success && response.data) {
        setData(response.data)
      } else {
        throw new Error(response.error || "Failed to load category breakdown")
      }
    } catch (err) {
      console.error("Error loading category breakdown:", err)
      setError(err instanceof Error ? err.message : "Failed to load category breakdown")
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
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">No category data available</div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.totalAmount,
  }))

  const chartConfig = data.reduce(
    (config, item, index) => {
      config[item.category.toLowerCase()] = {
        label: item.category,
        color: COLORS[index % COLORS.length],
      }
      return config
    },
    {} as Record<string, { label: string; color: string }>,
  )

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) + '%' : '0%'}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Amount"]} />}
        />
        <Legend />
      </PieChart>
    </ChartContainer>
  )
}
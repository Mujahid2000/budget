"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, CheckCircle, Target, Loader2, AlertCircle } from "lucide-react"
import { budgetApi, analyticsApi } from "@/lib/api"

interface InsightData {
  category: string
  budget: number
  actual: number
  difference: number
  percentage: number
  status: "over" | "under" | "good"
}

export function SpendingInsights() {
  const [insights, setInsights] = useState<InsightData[]>([])
  const [topCategory, setTopCategory] = useState<{ category: string; amount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
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
        throw new Error("Failed to load insights data")
      }

      const budgets = budgetsResponse.data || []
      const categories = categoryResponse.data || []

      // Create insights data
      const insightsData = budgets.map((budget) => {
        const categoryData = categories.find((cat) => cat.category === budget.category)
        const actual = categoryData?.totalAmount || 0
        const difference = actual - budget.amount
        const percentage = budget.amount > 0 ? (actual / budget.amount) * 100 : 0

        return {
          category: budget.category,
          budget: budget.amount,
          actual,
          difference,
          percentage,
          status: difference > 0 ? "over" : difference < -budget.amount * 0.2 ? "under" : "good",
        } as InsightData
      })

      setInsights(insightsData)

      // Find top spending category
      const topCat = categories.reduce(
        (max, cat) => (cat.totalAmount > max.amount ? { category: cat.category, amount: cat.totalAmount } : max),
        { category: "", amount: 0 },
      )

      setTopCategory(topCat.category ? topCat : null)
    } catch (err) {
      console.error("Error loading insights:", err)
      setError(err instanceof Error ? err.message : "Failed to load insights")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading insights...</p>
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

  const overBudgetCategories = insights.filter((insight) => insight.status === "over")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Spending Insights
          </CardTitle>
          <CardDescription>Analysis of your spending patterns and budget performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overspending Alerts */}
          {overBudgetCategories.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Budget Alert:</strong> You&apos;ve overspent in {overBudgetCategories.length}
                {overBudgetCategories.length === 1 ? " category" : " categories"}:
                <div className="mt-2 space-y-1">
                  {overBudgetCategories.map((insight) => (
                    <div key={insight.category} className="text-sm">
                      <strong>{insight.category}:</strong> Overspent by ₹{Math.abs(insight.difference).toLocaleString()}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Top Spending Category */}
          {topCategory && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Top Spending Category:</strong> {topCategory.category} with ₹
                {topCategory.amount.toLocaleString()} spent this month.
              </AlertDescription>
            </Alert>
          )}

          {/* Budget Performance Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight) => (
              <div key={insight.category} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{insight.category}</h4>
                  <Badge
                    variant={
                      insight.status === "over" ? "destructive" : insight.status === "good" ? "default" : "secondary"
                    }
                  >
                    {insight.status === "over"
                      ? "Over Budget"
                      : insight.status === "good"
                        ? "On Track"
                        : "Under Budget"}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span>₹{insight.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Actual:</span>
                    <span className={insight.status === "over" ? "text-red-600 font-semibold" : ""}>
                      ₹{insight.actual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Usage:</span>
                    <span className={insight.percentage > 100 ? "text-red-600 font-semibold" : ""}>
                      {insight.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      insight.percentage > 100
                        ? "bg-red-500"
                        : insight.percentage > 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(insight.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Success Message */}
          {overBudgetCategories.length === 0 && insights.length > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Great job!</strong> You&apos;re staying within budget across all categories.
              </AlertDescription>
            </Alert>
          )}

          {/* No Data Message */}
          {insights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Set up budgets to see spending insights and recommendations.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

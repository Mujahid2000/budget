"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { Dashboard } from "@/components/dashboard"
import { BudgetForm } from "@/components/budget-form"
import { BudgetComparisonChart } from "@/components/budget-comparison-chart"
import { SpendingInsights } from "@/components/spending-insights"
import { DollarSign, TrendingUp, PieChart, Target, AlertCircle, Loader2 } from "lucide-react"
import { transactionApi, budgetApi, type Transaction, type Budget } from "@/lib/api"

export default function PersonalFinanceVisualizer() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [transactionsResponse, budgetsResponse] = await Promise.all([
        transactionApi.getAll({ limit: 100 }),
        budgetApi.getAll(),
      ])

      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data)
      } else {
        throw new Error(transactionsResponse.error || "Failed to load transactions")
      }

      if (budgetsResponse.success && budgetsResponse.data) {
        setBudgets(budgetsResponse.data)
      } else {
        throw new Error(budgetsResponse.error || "Failed to load budgets")
      }
    } catch (err) {
      console.error("Error loading data:", err)
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addTransaction = async (transactionData: {
    amount: number
    date: string
    description: string
    category: string
  }) => {
    try {
      const response = await transactionApi.create(transactionData)
      if (response.success && response.data) {
        setTransactions([response.data, ...transactions])
      } else {
        throw new Error(response.error || "Failed to create transaction")
      }
    } catch (err) {
      console.error("Error creating transaction:", err)
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    }
  }

  const editTransaction = async (
    id: string,
    updatedTransaction: {
      amount: number
      date: string
      description: string
      category: string
    },
  ) => {
    try {
      const response = await transactionApi.update(id, updatedTransaction)
      if (response.success && response.data) {
        setTransactions(transactions.map((t) => (t._id === id ? response.data! : t)))
      } else {
        throw new Error(response.error || "Failed to update transaction")
      }
    } catch (err) {
      console.error("Error updating transaction:", err)
      setError(err instanceof Error ? err.message : "Failed to update transaction")
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await transactionApi.delete(id)
      if (response.success) {
        setTransactions(transactions.filter((t) => t._id !== id))
      } else {
        throw new Error(response.error || "Failed to delete transaction")
      }
    } catch (err) {
      console.error("Error deleting transaction:", err)
      setError(err instanceof Error ? err.message : "Failed to delete transaction")
    }
  }

  const addBudget = async (budgetData: {
    category: string
    amount: number
  }) => {
    try {
      const response = await budgetApi.createOrUpdate(budgetData)
      if (response.success && response.data) {
        // Check if budget already exists for this category
        const existingIndex = budgets.findIndex((b) => b.category === budgetData.category)
        if (existingIndex >= 0) {
          // Update existing budget
          const updatedBudgets = [...budgets]
          updatedBudgets[existingIndex] = response.data
          setBudgets(updatedBudgets)
        } else {
          // Add new budget
          setBudgets([...budgets, response.data])
        }
      } else {
        throw new Error(response.error || "Failed to save budget")
      }
    } catch (err) {
      console.error("Error saving budget:", err)
      setError(err instanceof Error ? err.message : "Failed to save budget")
    }
  }

 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Personal Finance Visualizer</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Track expenses, manage budgets, and visualize your financial data
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add Transaction</CardTitle>
                  <CardDescription>Record your income and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionForm onSubmit={addTransaction} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expenses</CardTitle>
                  <CardDescription>Your spending trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <MonthlyExpensesChart />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Manage your transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} onDelete={deleteTransaction} onEdit={editTransaction} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Distribution</CardTitle>
                  <CardDescription>See how your money is spent across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoryPieChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Detailed view of spending by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Food", "Transport", "Entertainment", "Housing"].map((category) => {
                      const categoryTotal = transactions
                        .filter((t) => t.category === category)
                        .reduce((sum, t) => sum + t.amount, 0)

                      return (
                        <div
                          key={category}
                          className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                        >
                          <span className="font-medium">{category}</span>
                          <span className="text-lg font-bold">₹{categoryTotal.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Set Budget</CardTitle>
                  <CardDescription>Define spending limits for each category</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetForm onSubmit={addBudget} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                  <CardDescription>Compare your planned vs actual spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <BudgetComparisonChart />
                </CardContent>
              </Card>
            </div>

            <SpendingInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

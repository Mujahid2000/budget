export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface Transaction {
  _id: string
  amount: number
  date: string
  description: string
  category: string
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface Budget {
  _id: string
  category: string
  amount: number
  userId?: string
  month: number
  year: number
  createdAt: string
  updatedAt: string
}

export interface DashboardData {
  totalExpenses: number
  transactionCount: number
  totalBudget: number
  topCategory: { category: string; amount: number } | null
  recentTransactions: Transaction[]
  categoryTotals: { category: string; amount: number }[]
  month: number
  year: number
}

export interface MonthlyExpense {
  year: number
  month: number
  monthName: string
  totalExpenses: number
  transactionCount: number
}

export interface CategoryBreakdown {
  category: string
  totalAmount: number
  transactionCount: number
  avgAmount: number
  percentage: number
}

const API_BASE = "/api"

// Transaction API functions
export const transactionApi = {
  // Get all transactions
  getAll: async (params?: {
    category?: string
    startDate?: string
    endDate?: string
    limit?: number
    page?: number
  }): Promise<ApiResponse<Transaction[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.append("category", params.category)
    if (params?.startDate) searchParams.append("startDate", params.startDate)
    if (params?.endDate) searchParams.append("endDate", params.endDate)
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.page) searchParams.append("page", params.page.toString())

    const response = await fetch(`${API_BASE}/transactions?${searchParams}`)
    return response.json()
  },

  // Get single transaction
  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    const response = await fetch(`${API_BASE}/transactions/${id}`)
    return response.json()
  },

  // Create transaction
  create: async (transaction: {
    amount: number
    date: string
    description: string
    category: string
  }): Promise<ApiResponse<Transaction>> => {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })
    return response.json()
  },

  // Update transaction
  update: async (
    id: string,
    transaction: {
      amount?: number
      date?: string
      description?: string
      category?: string
    },
  ): Promise<ApiResponse<Transaction>> => {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    })
    return response.json()
  },

  // Delete transaction
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

// Budget API functions
export const budgetApi = {
  // Get all budgets
  getAll: async (params?: {
    month?: number
    year?: number
  }): Promise<ApiResponse<Budget[]>> => {
    const searchParams = new URLSearchParams()
    if (params?.month) searchParams.append("month", params.month.toString())
    if (params?.year) searchParams.append("year", params.year.toString())

    const response = await fetch(`${API_BASE}/budgets?${searchParams}`)
    return response.json()
  },

  // Create or update budget
  createOrUpdate: async (budget: {
    category: string
    amount: number
    month?: number
    year?: number
  }): Promise<ApiResponse<Budget>> => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(budget),
    })
    return response.json()
  },

  // Update budget
  update: async (id: string, amount: number): Promise<ApiResponse<Budget>> => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    })
    return response.json()
  },

  // Delete budget
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

// Analytics API 
export const analyticsApi = {
  // Get dashboard data
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await fetch(`${API_BASE}/analytics/dashboard`)
    return response.json()
  },

  // Get monthly expenses
  getMonthlyExpenses: async (months = 6): Promise<ApiResponse<MonthlyExpense[]>> => {
    const response = await fetch(`${API_BASE}/analytics/monthly-expenses?months=${months}`)
    return response.json()
  },

  // Get category breakdown
  getCategoryBreakdown: async (params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<CategoryBreakdown[]> & { total?: number }> => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append("startDate", params.startDate)
    if (params?.endDate) searchParams.append("endDate", params.endDate)

    const response = await fetch(`${API_BASE}/analytics/category-breakdown?${searchParams}`)
    return response.json()
  },
}

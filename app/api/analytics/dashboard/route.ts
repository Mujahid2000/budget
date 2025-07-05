import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import Budget from "@/models/Budget"

// GET /api/analytics/dashboard - Get dashboard summary data
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"

    // Get current month/year
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get current month transactions
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfMonth = new Date(currentYear, currentMonth, 0)

    // Get total expenses for current month
    const totalExpenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ])

    // Get total budget for current month
    const totalBudget = await Budget.aggregate([
      {
        $match: {
          userId,
          month: currentMonth,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ])

    // Get top spending category
    const topCategory = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          amount: "$total",
        },
      },
    ])

    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(5).lean()

    // Get category totals for current month
    const categoryTotals = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          amount: "$total",
        },
      },
    ])

    const dashboardData = {
      totalExpenses: totalExpenses[0]?.total || 0,
      transactionCount: totalExpenses[0]?.count || 0,
      totalBudget: totalBudget[0]?.total || 0,
      topCategory: topCategory[0] || null,
      recentTransactions,
      categoryTotals,
      month: currentMonth,
      year: currentYear,
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error("GET /api/analytics/dashboard error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
      },
      { status: 500 },
    )
  }
}

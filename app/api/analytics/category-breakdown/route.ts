import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Transaction from "@/models/Transaction"

// GET /api/analytics/category-breakdown - Get category-wise expense breakdown
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build date filter
    const dateFilter: any = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    const matchStage: any = { userId }
    if (Object.keys(dateFilter).length > 0) {
      matchStage.date = dateFilter
    }

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
          transactionCount: 1,
          avgAmount: { $round: ["$avgAmount", 2] },
        },
      },
    ])

    // Calculate total for percentages
    const total = categoryBreakdown.reduce((sum, item) => sum + item.totalAmount, 0)

    const categoryBreakdownWithPercentage = categoryBreakdown.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.totalAmount / total) * 100 * 100) / 100 : 0,
    }))

    return NextResponse.json({
      success: true,
      data: categoryBreakdownWithPercentage,
      total,
    })
  } catch (error) {
    console.error("GET /api/analytics/category-breakdown error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category breakdown",
      },
      { status: 500 },
    )
  }
}

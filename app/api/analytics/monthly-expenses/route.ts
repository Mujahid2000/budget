import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Transaction from "@/models/Transaction"

// GET /api/analytics/monthly-expenses - Get monthly expense data
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"
    const months = Number.parseInt(searchParams.get("months") || "6")

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const monthlyExpenses = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalExpenses: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalExpenses: 1,
          transactionCount: 1,
          monthName: {
            $arrayElemAt: [
              ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              "$_id.month",
            ],
          },
        },
      },
    ])

    return NextResponse.json({
      success: true,
      data: monthlyExpenses,
    })
  } catch (error) {
    console.error("GET /api/analytics/monthly-expenses error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch monthly expenses",
      },
      { status: 500 },
    )
  }
}

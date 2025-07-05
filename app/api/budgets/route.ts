import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Budget from "@/models/Budget"

// GET /api/budgets - Get all budgets
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    // Build query
    const query: any = { userId }

    // Default to current month/year if not specified
    const now = new Date()
    const currentMonth = month ? Number.parseInt(month) : now.getMonth() + 1
    const currentYear = year ? Number.parseInt(year) : now.getFullYear()

    query.month = currentMonth
    query.year = currentYear

    const budgets = await Budget.find(query).sort({ category: 1 }).lean()

    return NextResponse.json({
      success: true,
      data: budgets,
    })
  } catch (error) {
    console.error("GET /api/budgets error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch budgets",
      },
      { status: 500 },
    )
  }
}

// POST /api/budgets - Create or update a budget
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { category, amount, userId = "default-user", month, year } = body

    // Validation
    if (!category || amount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: category, amount",
        },
        { status: 400 },
      )
    }

    if (amount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget amount cannot be negative",
        },
        { status: 400 },
      )
    }

    const validCategories = ["Food", "Transport", "Entertainment", "Housing", "Healthcare", "Shopping", "Utilities"]
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category",
        },
        { status: 400 },
      )
    }

    // Default to current month/year if not specified
    const now = new Date()
    const budgetMonth = month || now.getMonth() + 1
    const budgetYear = year || now.getFullYear()

    // Use upsert to create or update
    const budget = await Budget.findOneAndUpdate(
      {
        userId,
        category,
        month: budgetMonth,
        year: budgetYear,
      },
      {
        amount: Number.parseFloat(amount),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean()

    return NextResponse.json(
      {
        success: true,
        data: budget,
        message: "Budget saved successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST /api/budgets error:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save budget",
      },
      { status: 500 },
    )
  }
}

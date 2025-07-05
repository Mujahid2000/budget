import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
// Define query interface
interface TransactionQuery {
  userId: string;
  category?: string;
  date?: {
    $gte?: Date;
    $lte?: Date;
  };
}
// GET /api/transactions - Get all transactions
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "default-user"
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const page = Number.parseInt(searchParams.get("page") || "1")

    // Build query
    const query: TransactionQuery = { userId } //Unexpected any. Specify a different type.

    if (category) {
      query.category = category
    }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const transactions = await Transaction.find(query).sort({ date: -1, createdAt: -1 }).limit(limit).skip(skip).lean()

    const total = await Transaction.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("GET /api/transactions error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
      },
      { status: 500 },
    )
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { amount, date, description, category, userId = "default-user" } = body

    // Validation
    if (!amount || !date || !description || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: amount, date, description, category",
        },
        { status: 400 },
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be greater than 0",
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

    const transaction = new Transaction({
      amount: Number.parseFloat(amount),
      date: new Date(date),
      description: description.trim(),
      category,
      userId,
    })

    await transaction.save()

    return NextResponse.json(
      {
        success: true,
        data: transaction,
        message: "Transaction created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("POST /api/transactions error:", error)

    if (error as unknown) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error || "Invalid input data",
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create transaction",
      },
      { status: 500 },
    )
  }
}

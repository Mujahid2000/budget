import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Transaction from "@/models/Transaction"
import mongoose from "mongoose"
// Define update data interface
interface UpdateTransactionData {
  amount?: number;
  date?: Date;
  description?: string;
  category?: string;
}
// GET /api/transactions/[id] - Get a specific transaction
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transaction ID",
        },
        { status: 400 },
      )
    }

    const transaction = await Transaction.findById(id).lean()

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    console.error("GET /api/transactions/[id] error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transaction",
      },
      { status: 500 },
    )
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params
    const body = await request.json()
    const { amount, date, description, category } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transaction ID",
        },
        { status: 400 },
      )
    }

    // Validation
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be greater than 0",
        },
        { status: 400 },
      )
    }

    const validCategories = ["Food", "Transport", "Entertainment", "Housing", "Healthcare", "Shopping", "Utilities"]
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category",
        },
        { status: 400 },
      )
    }

    const updateData: UpdateTransactionData = {}
    if (amount !== undefined) updateData.amount = Number.parseFloat(amount)
    if (date) updateData.date = new Date(date)
    if (description !== undefined) updateData.description = description.trim()
    if (category) updateData.category = category

    const transaction = await Transaction.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean()

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: "Transaction updated successfully",
    })
  } catch (error) {
    console.error("PUT /api/transactions/[id] error:", error)

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
        error: "Failed to update transaction",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect()

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid transaction ID",
        },
        { status: 400 },
      )
    }

    const transaction = await Transaction.findByIdAndDelete(id).lean()

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    })
  } catch (error) {
    console.error("DELETE /api/transactions/[id] error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete transaction",
      },
      { status: 500 },
    )
  }
}

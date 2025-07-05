import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Budget from "@/models/Budget"
import mongoose from "mongoose"

// DELETE /api/budgets/[id] - Delete a budget
export async function DELETE(request: NextRequest, paramsPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    // Resolve the params Promise to get the id
    const { params } = await paramsPromise
    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid budget ID",
        },
        { status: 400 },
      )
    }

    const budget = await Budget.findByIdAndDelete(id).lean()

    if (!budget) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Budget deleted successfully",
    })
  } catch (error) {
    console.error("DELETE /api/budgets/[id] error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete budget",
      },
      { status: 500 },
    )
  }
}

// PUT /api/budgets/[id] - Update a budget
export async function PUT(request: NextRequest, paramsPromise: Promise<{ params: { id: string } }>) {
  try {
    await dbConnect()

    // Resolve the params Promise to get the id
    const { params } = await paramsPromise
    const { id } = params
    const body = await request.json()
    const { amount } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid budget ID",
        },
        { status: 400 },
      )
    }

    if (amount === undefined || amount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid amount is required and cannot be negative",
        },
        { status: 400 },
      )
    }

    const budget = await Budget.findByIdAndUpdate(
      id,
      { amount: Number.parseFloat(amount) },
      { new: true, runValidators: true },
    ).lean()

    if (!budget) {
      return NextResponse.json(
        {
          success: false,
          error: "Budget not found",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: budget,
      message: "Budget updated successfully",
    })
  } catch (error) {
    console.error("PUT /api/budgets/[id] error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update budget",
      },
      { status: 500 },
    )
  }
}
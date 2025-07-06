import mongoose, { type Document, Schema } from "mongoose"

export interface IBudget extends Document {
  category: string
  amount: number
  userId?: string
  month: number
  year: number
  createdAt: Date
  updatedAt: Date
}

const BudgetSchema = new Schema<IBudget>(
  {
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Food", "Transport", "Entertainment", "Housing", "Healthcare", "Shopping", "Utilities"],
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0, "Budget amount cannot be negative"],
    },
    userId: {
      type: String,
      default: "default-user", 
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 2020,
    },
  },
  {
    timestamps: true,
  },
)


BudgetSchema.index({ userId: 1, category: 1, month: 1, year: 1 }, { unique: true })

export default mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema)

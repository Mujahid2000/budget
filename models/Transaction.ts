import mongoose, { type Document, Schema } from "mongoose"

export interface ITransaction extends Document {
  amount: number
  date: Date
  description: string
  category: string
  userId?: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Food", "Transport", "Entertainment", "Housing", "Healthcare", "Shopping", "Utilities"],
    },
    userId: {
      type: String,
      default: "default-user", // For demo purposes, in real app this would be from auth
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
TransactionSchema.index({ userId: 1, date: -1 })
TransactionSchema.index({ userId: 1, category: 1 })

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema)

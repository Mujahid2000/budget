"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetFormProps {
  onSubmit: (budget: {
    category: string
    amount: number
  }) => void
}

const categories = ["Food", "Transport", "Entertainment", "Housing", "Healthcare", "Shopping", "Utilities"]

export function BudgetForm({ onSubmit }: BudgetFormProps) {
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!category) {
      newErrors.category = "Category is required"
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Budget amount must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit({
      category,
      amount: Number(amount),
    })

    // Reset form
    setCategory("")
    setAmount("")
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className={cn(errors.category && "border-red-500")}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{errors.category}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget-amount">Budget Amount (₹)</Label>
        <Input
          id="budget-amount"
          type="number"
          placeholder="Enter budget amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={cn(errors.amount && "border-red-500")}
        />
        {errors.amount && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{errors.amount}</AlertDescription>
          </Alert>
        )}
      </div>

      <Button type="submit" className="w-full">
        Save Budget
      </Button>
    </form>
  )
}

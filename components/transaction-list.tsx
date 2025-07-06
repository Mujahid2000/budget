"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Edit } from "lucide-react"
import type { Transaction } from "@/lib/api"
import { useState } from "react"
import { EditTransactionDialog } from "./edit-transaction-dialog"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onEdit: (
    id: string,
    transaction: {
      amount: number
      date: string
      description: string
      category: string
    },
  ) => void
}

const categoryColors: Record<string, string> = {
  Food: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Transport: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Entertainment: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Housing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Healthcare: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  Utilities: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found. Add your first transaction above.
      </div>
    )
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge className={categoryColors[transaction.category] || "bg-gray-100 text-gray-800"}>
                    {transaction.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">${transaction.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(transaction._id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(transaction._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{transaction.description}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${transaction.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <Badge className={categoryColors[transaction.category] || "bg-gray-100 text-gray-800"}>
                  {transaction.category}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(transaction._id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(transaction._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <EditTransactionDialog
        transaction={editingId ? transactions.find((t) => t._id === editingId) || null : null}
        open={editingId !== null}
        onOpenChange={(open) => !open && setEditingId(null)}
        onSave={onEdit}
      />
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button, Select, Card, Label, Textarea } from "flowbite-react"
import { FaPlus, FaCalendarAlt } from "react-icons/fa"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function AddExpenses() {
  const [newExpense, setNewExpense] = useState({
    expenseDate: new Date(),
    expenseCategory: "",
    expenseAmount: "",
    expenseNote: "",
  })
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/expenseCategories/")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to fetch categories. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date) => {
    setNewExpense((prev) => ({ ...prev, expenseDate: date }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("http://localhost:4000/api/expenses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newExpense,
          expenseDate: newExpense.expenseDate.toISOString(),
          expenseAmount: Number.parseFloat(newExpense.expenseAmount),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add expense")
      }

      const data = await response.json()
      console.log("New expense added:", data)
      setNewExpense({
        expenseDate: new Date(),
        expenseCategory: "",
        expenseAmount: "",
        expenseNote: "",
      })
    } catch (error) {
      console.error("Error adding expense:", error)
      setError("Failed to add expense. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="w-full">
        <h2 className="text-2xl font-bold mb-6">Add New Expense</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="expenseDate" className="block mb-2">
                Expense Date
              </Label>
              <div className="relative">
                <DatePicker
                  id="expenseDate"
                  selected={newExpense.expenseDate}
                  onChange={handleDateChange}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  dateFormat="yyyy-MM-dd"
                />
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <Label htmlFor="expenseCategory" className="block mb-2">
                Expense Category
              </Label>
              <Select
                id="expenseCategory"
                name="expenseCategory"
                value={newExpense.expenseCategory}
                onChange={handleInputChange}
                required
                className="w-full"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="expenseAmount" className="block mb-2">
                Expense Amount
              </Label>
              <input
                id="expenseAmount"
                type="number"
                name="expenseAmount"
                placeholder="Enter amount"
                value={newExpense.expenseAmount}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="expenseNote" className="block mb-2">
                Transaction Note
              </Label>
              <Textarea
                id="expenseNote"
                name="expenseNote"
                placeholder="Enter note"
                value={newExpense.expenseNote}
                onChange={handleInputChange}
                className="w-full p-2.5"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={isSubmitting}>
              <FaPlus className="mr-2" />
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


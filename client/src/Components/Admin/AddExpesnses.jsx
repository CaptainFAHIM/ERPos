"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Button, Card, Label, Textarea, Select, Toast } from "flowbite-react"
import {
  FiPlus,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiAlertCircle,
  FiPackage,
  FiList,
} from "react-icons/fi"
import { HiX } from "react-icons/hi"
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
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  const toastTimeout = useRef(null)

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type })

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current)
    }

    toastTimeout.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/api/expenseCategories/")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Failed to fetch categories", "error")
      setError("Failed to fetch categories. Please try again.")
    }
  }, [showToast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

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
      showToast("Expense added successfully")
      setNewExpense({
        expenseDate: new Date(),
        expenseCategory: "",
        expenseAmount: "",
        expenseNote: "",
      })
    } catch (error) {
      console.error("Error adding expense:", error)
      showToast("Failed to add expense", "error")
      setError("Failed to add expense. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl blur-lg"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <FiPackage className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
                <p className="text-sm text-gray-500">Create a new expense record</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Picker */}
                <div>
                  <Label htmlFor="expenseDate" className="text-gray-700">
                    Expense Date
                  </Label>
                  <div className="relative mt-2">
                    <DatePicker
                      id="expenseDate"
                      selected={newExpense.expenseDate}
                      onChange={handleDateChange}
                      className="w-full rounded-lg border border-gray-200 bg-white p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      dateFormat="yyyy-MM-dd"
                    />
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Category Select */}
                <div>
                  <Label htmlFor="expenseCategory" className="text-gray-700">
                    Expense Category
                  </Label>
                  <div className="relative mt-2">
                    <Select
                      id="expenseCategory"
                      name="expenseCategory"
                      value={newExpense.expenseCategory}
                      onChange={handleInputChange}
                      required
                      className="w-full shadow-sm"
                      icon={FiList}
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.categoryName}>
                          {category.categoryName}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <Label htmlFor="expenseAmount" className="text-gray-700">
                    Expense Amount
                  </Label>
                  <div className="relative mt-2">
                    <div className="relative">
                      <input
                        id="expenseAmount"
                        type="number"
                        name="expenseAmount"
                        placeholder="Enter amount"
                        value={newExpense.expenseAmount}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                      />
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Note Textarea */}
                <div className="md:col-span-2">
                  <Label htmlFor="expenseNote" className="text-gray-700">
                    Transaction Note
                  </Label>
                  <div className="relative mt-2">
                    <div className="relative">
                      <Textarea
                        id="expenseNote"
                        name="expenseNote"
                        placeholder="Enter note"
                        value={newExpense.expenseNote}
                        onChange={handleInputChange}
                        className="w-full shadow-sm"
                        rows={4}
                      />
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Expense"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Toast Notifications */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast>
              <div className="flex items-center gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${toast.type === "error" ? "bg-red-100 text-red-600" : ""}
                  ${toast.type === "success" ? "bg-green-100 text-green-600" : ""}
                  ${toast.type === "warning" ? "bg-yellow-100 text-yellow-600" : ""}
                `}
                >
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-gray-900">{toast.message}</div>
                <button
                  onClick={() => setToast({ show: false, message: "", type: "" })}
                  className="ml-auto text-gray-400 hover:text-gray-500"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </Toast>
          </div>
        )}
      </div>
    </div>
  )
}

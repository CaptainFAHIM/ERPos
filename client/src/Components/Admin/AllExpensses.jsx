"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Button, Modal, Spinner, TextInput, Toast } from "flowbite-react"
import {
  FiDollarSign,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiAlertCircle,
  FiBarChart2,
  FiTrendingUp,
  FiCreditCard,
  FiDownload,
  FiPrinter,
} from "react-icons/fi"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { HiX } from "react-icons/hi"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function AllExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [editingExpense, setEditingExpense] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

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

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/api/expenses/")
      if (!response.ok) {
        throw new Error("Failed to fetch expenses")
      }
      const data = await response.json()
      setExpenses(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching expenses:", error)
      showToast("Failed to fetch expenses", "error")
      setError("Failed to fetch expenses. Please try again.")
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:4000/api/expenses/${editingExpense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingExpense),
      })
      if (!response.ok) {
        throw new Error("Failed to update expense")
      }
      const updatedExpense = await response.json()
      setExpenses(expenses.map((exp) => (exp._id === updatedExpense.expense._id ? updatedExpense.expense : exp)))
      showToast("Expense updated successfully")
      setShowEditModal(false)
    } catch (error) {
      console.error("Error updating expense:", error)
      showToast("Failed to update expense", "error")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/expenses/${deletingId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete expense")
      }
      setExpenses(expenses.filter((expense) => expense._id !== deletingId))
      showToast("Expense deleted successfully")
      setShowDeleteModal(false)
      setDeletingId(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
      showToast("Failed to delete expense", "error")
    }
  }

  const calculateSummary = (filteredExpenses) => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0)
    const thisMonth = new Date().getMonth()
    const thisMonthTotal = filteredExpenses
      .filter((expense) => new Date(expense.expenseDate).getMonth() === thisMonth)
      .reduce((sum, expense) => sum + expense.expenseAmount, 0)

    return {
      total: total.toFixed(2),
      thisMonth: thisMonthTotal.toFixed(2),
    }
  }

  const prepareChartData = (filteredExpenses) => {
    const monthlyData = {}
    filteredExpenses.forEach((expense) => {
      const month = new Date(expense.expenseDate).toLocaleString("default", { month: "short" })
      if (!monthlyData[month]) {
        monthlyData[month] = 0
      }
      monthlyData[month] += expense.expenseAmount
    })
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
  }

  const filterExpenses = () => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate)
      const isInDateRange =
        (!startDate || expenseDate >= new Date(startDate)) && (!endDate || expenseDate <= new Date(endDate))
      const matchesSearch =
        expense.expenseCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.expenseNote.toLowerCase().includes(searchTerm.toLowerCase())
      return isInDateRange && matchesSearch
    })
  }

  const filteredExpenses = filterExpenses()
  const summary = calculateSummary(filteredExpenses)
  const chartData = prepareChartData(filteredExpenses)

  const handlePrint = () => {
    const printContent = document.getElementById("printableArea").innerHTML
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printContent
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Expense Report", 14, 22)

    // Add period
    doc.setFontSize(11)
    doc.text(
      `Period: ${startDate ? new Date(startDate).toLocaleDateString() : "All time"} - ${
        endDate ? new Date(endDate).toLocaleDateString() : "Present"
      }`,
      14,
      32,
    )
    doc.text(`Total Expenses: ৳${Number(summary.total).toLocaleString()}`, 14, 40)

    // Add table
    doc.autoTable({
      startY: 50,
      head: [["Date", "Category", "Amount", "Note"]],
      body: filteredExpenses.map((expense) => [
        new Date(expense.expenseDate).toLocaleDateString(),
        expense.expenseCategory,
        `৳${expense.expenseAmount.toLocaleString()}`,
        expense.expenseNote,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Save the PDF
    doc.save("expense-report.pdf")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-500">Loading expenses...</p>
        </div>
      </div>
    )
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
                  <FiDollarSign className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
                <p className="text-sm text-gray-500">Track and manage your expenses</p>
              </div>
            </div>
            <Button
              onClick={() => setShowPrintModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FiPrinter className="w-5 h-5 mr-2" />
              Print Report
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiBarChart2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Expense History</h2>
            </div>
            <div className="h-72 bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={10} barCategoryGap={20}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="month" tick={{ fill: "#374151", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="url(#blueGradient)" radius={[4, 4, 0, 0]} barSize={40} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Expense Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Expense Summary</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <FiCreditCard className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Total Expenses</p>
                      <h3 className="text-2xl font-bold text-blue-700">৳{Number(summary.total).toLocaleString()}</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-200 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">This Month</p>
                      <h3 className="text-2xl font-bold text-green-700">
                        ৳{Number(summary.thisMonth).toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              icon={FiCalendar}
            />
            <TextInput
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              icon={FiCalendar}
            />
            <TextInput
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
            />
          </div>
        </motion.div>

        {/* Expenses Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Note</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((expense) => (
                  <motion.tr
                    key={expense._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                          <FiCreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{expense.expenseCategory}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      ৳{expense.expenseAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{expense.expenseNote}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(expense)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setDeletingId(expense._id)
                            setShowDeleteModal(true)
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border-0"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Edit Modal */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} className="backdrop-blur-sm">
          <Modal.Header className="border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Edit Expense</h3>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <TextInput
                  type="date"
                  value={editingExpense?.expenseDate.split("T")[0] || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, expenseDate: e.target.value })}
                  required
                  icon={FiCalendar}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <TextInput
                  type="text"
                  value={editingExpense?.expenseCategory || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, expenseCategory: e.target.value })}
                  required
                  icon={FiCreditCard}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <TextInput
                  type="number"
                  value={editingExpense?.expenseAmount || ""}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, expenseAmount: Number.parseFloat(e.target.value) })
                  }
                  required
                  icon={FiDollarSign}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <TextInput
                  type="text"
                  value={editingExpense?.expenseNote || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, expenseNote: e.target.value })}
                  icon={FiEdit2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  Update Expense
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        {/* Print Modal */}
        <Modal show={showPrintModal} onClose={() => setShowPrintModal(false)} className="backdrop-blur-sm">
          <Modal.Header className="border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Export Report</h3>
          </Modal.Header>
          <Modal.Body>
            <p className="text-gray-600 mb-6">Choose how you would like to export your expense report:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <FiPrinter className="w-5 h-5" />
                Print Report
              </Button>
              <Button
                onClick={handleExportPDF}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <FiDownload className="w-5 h-5" />
                Export PDF
              </Button>
            </div>
          </Modal.Body>
        </Modal>

        {/* Printable Area */}
        <div id="printableArea" style={{ display: "none" }}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Expense Report</h2>
            <div className="mb-4">
              <p className="text-gray-600">
                Period: {startDate ? new Date(startDate).toLocaleDateString() : "All time"} -{" "}
                {endDate ? new Date(endDate).toLocaleDateString() : "Present"}
              </p>
              <p className="text-gray-600">Total Expenses: ৳{Number(summary.total).toLocaleString()}</p>
            </div>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{expense.expenseCategory}</td>
                    <td className="border border-gray-300 px-4 py-2">৳{expense.expenseAmount.toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-2">{expense.expenseNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingId(null)
          }}
          className="backdrop-blur-sm"
        >
          <Modal.Header className="border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
          </Modal.Header>
          <Modal.Body>
            <div className="flex items-center gap-3 text-gray-600">
              <FiAlertCircle className="w-5 h-5 text-red-500" />
              <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-100">
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingId(null)
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white border-0">
                Delete
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  )
}


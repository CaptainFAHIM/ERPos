"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Button, TextInput, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"
import {
  FiDollarSign,
  FiUsers,
  FiPercent,
  FiSearch,
  FiCalendar,
  FiDownload,
  FiAlertCircle,
  FiShoppingCart,
  FiArrowUp,
  FiArrowDown,
  FiCheckCircle,
} from "react-icons/fi"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function CustomerLedger() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

  const safeString = useCallback((value) => {
    if (value === null || value === undefined) return ""
    return String(value)
  }, [])

  const safeNumber = useCallback((value) => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }, [])

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/sales/")
      setTransactions(response.data)
      setFilteredTransactions(response.data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      showToast("Failed to fetch transaction data", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      const searchableFields = [
        safeString(transaction.customerName),
        safeString(transaction.finalAmount),
        safeString(transaction.invoiceNo),
      ]

      const matchesSearch =
        !searchTerm || searchableFields.some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))

      const transactionDate = new Date(transaction.createdAt || new Date())
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDateRange = (!start || transactionDate >= start) && (!end || transactionDate <= end)

      return matchesSearch && matchesDateRange
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortConfig.key === "finalAmount") {
        return sortConfig.direction === "asc"
          ? safeNumber(a.finalAmount) - safeNumber(b.finalAmount)
          : safeNumber(b.finalAmount) - safeNumber(a.finalAmount)
      }
      return 0
    })

    setFilteredTransactions(sorted)
  }, [searchTerm, startDate, endDate, transactions, sortConfig, safeString, safeNumber])

  const stats = filteredTransactions.reduce(
    (acc, transaction) => {
      const amount = safeNumber(transaction.finalAmount)
      const customerName = safeString(transaction.customerName)

      acc.totalAmount += amount
      acc.transactionCount++
      acc.averageTransaction = acc.totalAmount / acc.transactionCount
      acc.highestTransaction = Math.max(acc.highestTransaction, amount)
      acc.lowestTransaction = amount > 0 ? Math.min(acc.lowestTransaction, amount) : acc.lowestTransaction
      if (customerName) acc.uniqueCustomers.add(customerName)

      return acc
    },
    {
      totalAmount: 0,
      transactionCount: 0,
      averageTransaction: 0,
      highestTransaction: 0,
      lowestTransaction: Number.POSITIVE_INFINITY,
      uniqueCustomers: new Set(),
    },
  )

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleExportExcel = () => {
    const summaryData = [
      ["Summary"],
      ["Total Amount", `৳${stats.totalAmount.toLocaleString()}`],
      ["Transaction Count", stats.transactionCount],
      ["Unique Customers", stats.uniqueCustomers.size],
      ["Average Transaction", `৳${stats.averageTransaction.toLocaleString()}`],
      [""],
      ["Transactions"],
    ]

    const transactionData = filteredTransactions.map((t) => ({
      Date: new Date(t.createdAt).toLocaleDateString(),
      Customer: t.customerName || "N/A",
      Amount: `৳${(t.finalAmount || 0).toLocaleString()}`,
      Status: "Paid",
    }))

    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, "Summary")

    const ws2 = XLSX.utils.json_to_sheet(transactionData)
    XLSX.utils.book_append_sheet(wb, ws2, "Transactions")

    XLSX.writeFile(wb, `customer_ledger_${new Date().toISOString().split("T")[0]}.xlsx`)
    showToast("Excel file exported successfully")
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Customer Ledger Report", 14, 22)

    // Add date range
    doc.setFontSize(11)
    const dateText =
      startDate && endDate
        ? `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        : `Date: ${new Date().toLocaleDateString()}`
    doc.text(dateText, 14, 32)

    // Add summary statistics
    doc.setFontSize(14)
    doc.text("Summary", 14, 45)

    const summaryData = [
      ["Total Amount", `৳${stats.totalAmount.toLocaleString()}`],
      ["Transaction Count", stats.transactionCount.toString()],
      ["Unique Customers", stats.uniqueCustomers.size.toString()],
      ["Average Transaction", `৳${stats.averageTransaction.toLocaleString()}`],
    ]

    doc.autoTable({
      startY: 50,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })

    // Add transactions
    doc.text("Transactions", 14, doc.previousAutoTable.finalY + 15)

    const transactionData = filteredTransactions.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.customerName || "N/A",
      `৳${(t.finalAmount || 0).toLocaleString()}`,
      "Paid",
    ])

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [["Date", "Customer", "Amount", "Status"]],
      body: transactionData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })

    // Save the PDF
    doc.save(`customer_ledger_${new Date().toISOString().split("T")[0]}.pdf`)
    showToast("PDF exported successfully")
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
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
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Ledger</h1>
              <p className="text-sm text-gray-500">Track customer transactions and payments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
      >
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="pl-10" />
        </div>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="pl-10" />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiUsers className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueCustomers.size}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.transactionCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FiPercent className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Transaction</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.averageTransaction.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {sortConfig.key === "createdAt" &&
                      (sortConfig.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort("finalAmount")}
                >
                  <div className="flex items-center gap-2">
                    Amount
                    {sortConfig.key === "finalAmount" &&
                      (sortConfig.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading
                  ? [...Array(5)].map((_, index) => (
                      <motion.tr
                        key={`skeleton-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="animate-pulse"
                      >
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </td>
                      </motion.tr>
                    ))
                  : filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {transaction.customerName || "Walk-in"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ৳{safeNumber(transaction.finalAmount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700">
                            <FiCheckCircle className="w-3 h-3" />
                            Paid
                          </span>
                        </td>
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
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
  )
}


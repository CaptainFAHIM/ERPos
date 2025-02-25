"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Button, TextInput, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"
import {
  FiDollarSign,
  FiTruck,
  FiAlertCircle,
  FiSearch,
  FiCalendar,
  FiDownload,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiUser,
  FiAlertTriangle,
} from "react-icons/fi"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function SupplierLedger() {
  const [ledger, setLedger] = useState([])
  const [filteredLedger, setFilteredLedger] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }, [])

  const safeNumber = useCallback((value) => {
    if (value === null || value === undefined) return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }, [])

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/payments/")
      const processedData = response.data.map((entry) => ({
        ...entry,
        totalPrice: safeNumber(entry.totalPrice),
        paidAmount: safeNumber(entry.paidAmount),
        dueAmount: safeNumber(entry.dueAmount),
        currentDue: safeNumber(entry.supplier?.dueAmount),
      }))
      setLedger(processedData)
      setFilteredLedger(processedData)
    } catch (error) {
      console.error("Error fetching supplier ledger:", error)
      showToast("Failed to fetch supplier ledger", "error")
    } finally {
      setLoading(false)
    }
  }, [safeNumber, showToast])

  useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  const summary = useMemo(() => {
    return filteredLedger.reduce(
      (acc, entry) => {
        const totalPrice = safeNumber(entry.totalPrice)
        const paidAmount = safeNumber(entry.paidAmount)
        const currentDue = safeNumber(entry.supplier?.dueAmount)

        acc.totalAmount += totalPrice
        acc.totalPaid += paidAmount
        acc.totalDue += currentDue
        acc.pendingPayments += currentDue > 0 ? 1 : 0
        acc.highestPayment = Math.max(acc.highestPayment, paidAmount)
        acc.lowestPayment = paidAmount > 0 ? Math.min(acc.lowestPayment, paidAmount) : acc.lowestPayment
        acc.paymentCount++

        if (!acc.suppliers.has(entry.supplier?._id)) {
          acc.suppliers.add(entry.supplier?._id)
          acc.uniqueSuppliers++
        }

        return acc
      },
      {
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        pendingPayments: 0,
        highestPayment: 0,
        lowestPayment: Number.POSITIVE_INFINITY,
        paymentCount: 0,
        suppliers: new Set(),
        uniqueSuppliers: 0,
      },
    )
  }, [filteredLedger, safeNumber])

  useEffect(() => {
    const filtered = ledger.filter((entry) => {
      const searchFields = [
        entry.supplier?.name,
        entry.totalPrice?.toString(),
        entry.paidAmount?.toString(),
        entry.supplier?.dueAmount?.toString(),
      ]

      const matchesSearch =
        !searchTerm || searchFields.some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))

      const entryDate = new Date(entry.createdAt)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDateRange = (!start || entryDate >= start) && (!end || entryDate <= end)

      return matchesSearch && matchesDateRange
    })

    const sorted = [...filtered].sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }

      const aValue = safeNumber(sortConfig.key === "currentDue" ? a.supplier?.dueAmount : a[sortConfig.key])
      const bValue = safeNumber(sortConfig.key === "currentDue" ? b.supplier?.dueAmount : b[sortConfig.key])

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
    })

    setFilteredLedger(sorted)
  }, [searchTerm, startDate, endDate, ledger, sortConfig, safeNumber])

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleExportExcel = () => {
    const summaryData = [
      ["Summary"],
      ["Total Amount", `৳${summary.totalAmount.toLocaleString()}`],
      ["Total Paid", `৳${summary.totalPaid.toLocaleString()}`],
      ["Total Due", `৳${summary.totalDue.toLocaleString()}`],
      ["Pending Payments", summary.pendingPayments],
      ["Unique Suppliers", summary.uniqueSuppliers],
      [""],
      ["Transactions"],
    ]

    const transactionData = filteredLedger.map((entry) => ({
      Date: new Date(entry.createdAt).toLocaleDateString(),
      Supplier: entry.supplier?.name || "N/A",
      "Total Price": `৳${entry.totalPrice.toLocaleString()}`,
      "Paid Amount": `৳${entry.paidAmount.toLocaleString()}`,
      "Current Due": `৳${entry.currentDue.toLocaleString()}`,
      Status: entry.currentDue > 0 ? "Pending" : "Paid",
    }))

    const wb = XLSX.utils.book_new()

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, "Summary")

    const ws2 = XLSX.utils.json_to_sheet(transactionData)
    XLSX.utils.book_append_sheet(wb, ws2, "Transactions")

    XLSX.writeFile(wb, `supplier_ledger_${new Date().toISOString().split("T")[0]}.xlsx`)
    showToast("Excel file exported successfully")
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Supplier Ledger Report", 14, 22)

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
      ["Total Amount", `৳${summary.totalAmount.toLocaleString()}`],
      ["Total Paid", `৳${summary.totalPaid.toLocaleString()}`],
      ["Total Due", `৳${summary.totalDue.toLocaleString()}`],
      ["Pending Payments", summary.pendingPayments.toString()],
      ["Unique Suppliers", summary.uniqueSuppliers.toString()],
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

    const transactionData = filteredLedger.map((entry) => [
      new Date(entry.createdAt).toLocaleDateString(),
      entry.supplier?.name || "N/A",
      `৳${entry.totalPrice.toLocaleString()}`,
      `৳${entry.paidAmount.toLocaleString()}`,
      `৳${entry.currentDue.toLocaleString()}`,
      entry.currentDue > 0 ? "Pending" : "Paid",
    ])

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [["Date", "Supplier", "Total", "Paid", "Due", "Status"]],
      body: transactionData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })

    // Save the PDF
    doc.save(`supplier_ledger_${new Date().toISOString().split("T")[0]}.pdf`)
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
                <FiTruck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Ledger</h1>
              <p className="text-sm text-gray-500">Track supplier payments and dues</p>
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
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{summary.uniqueSuppliers} suppliers</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {((summary.totalPaid / summary.totalAmount) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Due</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.totalDue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{summary.pendingPayments} pending payments</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Highest Payment</p>
              <p className="text-2xl font-bold text-gray-900">৳{summary.highestPayment.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                Avg: ৳{(summary.totalPaid / summary.paymentCount).toLocaleString()}
              </p>
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Supplier</th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort("totalPrice")}
                >
                  <div className="flex items-center gap-2">
                    Total Price
                    {sortConfig.key === "totalPrice" &&
                      (sortConfig.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort("paidAmount")}
                >
                  <div className="flex items-center gap-2">
                    Paid Amount
                    {sortConfig.key === "paidAmount" &&
                      (sortConfig.direction === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-600 cursor-pointer"
                  onClick={() => handleSort("currentDue")}
                >
                  <div className="flex items-center gap-2">
                    Current Due
                    {sortConfig.key === "currentDue" &&
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
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </td>
                      </motion.tr>
                    ))
                  : filteredLedger.map((entry) => (
                      <motion.tr
                        key={entry._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400" />
                            <span className="font-medium text-gray-900">{entry.supplier?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ৳{entry.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                          ৳{entry.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-red-600">
                          ৳{entry.currentDue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`
                            inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                            ${entry.currentDue > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}
                          `}
                          >
                            {entry.currentDue > 0 ? (
                              <>
                                <FiClock className="w-3 h-3" />
                                Pending
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="w-3 h-3" />
                                Paid
                              </>
                            )}
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


"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { Button, TextInput, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"
import {
  FiPackage,
  FiDollarSign,
  FiShoppingCart,
  FiPercent,
  FiStar,
  FiSearch,
  FiCalendar,
  FiDownload,
  FiAlertCircle,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function DailyReport() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [filteredSales, setFilteredSales] = useState([])

  useEffect(() => {
    fetchSales()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/sales/")
      setSales(response.data)
      setFilteredSales(response.data)
    } catch (error) {
      console.error("Error fetching sales:", error)
      showToast("Failed to fetch sales data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = sales.filter((sale) => {
      // Ensure all fields are converted to strings and handle null/undefined values
      const searchableFields = [
        String(sale.customerName || ""),
        String(sale.invoiceNo || ""),
        String(sale.transactionNo || ""),
        String(sale.finalAmount || "0"),
      ]

      const matchesSearch =
        !searchTerm || searchableFields.some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))

      const saleDate = new Date(sale.createdAt)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDateRange = (!start || saleDate >= start) && (!end || saleDate <= end)

      return matchesSearch && matchesDateRange
    })

    setFilteredSales(filtered)
  }, [searchTerm, startDate, endDate, sales])

  const calculateStats = (sales) => {
    return sales.reduce(
      (acc, sale) => {
        // Calculate total sales, transactions, discounts
        acc.totalSales += sale.finalAmount || 0
        acc.totalTransactions++
        acc.totalDiscounts += sale.discount || 0

        // Calculate customer sales
        if (sale.customerName) {
          if (!acc.customerSales[sale.customerName]) {
            acc.customerSales[sale.customerName] = { total: 0, count: 0 }
          }
          acc.customerSales[sale.customerName].total += sale.finalAmount || 0
          acc.customerSales[sale.customerName].count++
        }

        // Calculate product sales
        if (sale.products && Array.isArray(sale.products)) {
          sale.products.forEach((product) => {
            const productId = product.productId._id
            if (!acc.productSales[productId]) {
              acc.productSales[productId] = {
                name: product.productId.description,
                quantity: 0,
                total: 0,
                barcode: product.productId.barcode,
              }
            }
            acc.productSales[productId].quantity += product.quantity || 0
            acc.productSales[productId].total += product.totalPrice || 0
          })
        }

        return acc
      },
      {
        totalSales: 0,
        totalTransactions: 0,
        totalDiscounts: 0,
        customerSales: {},
        productSales: {},
      },
    )
  }

  const stats = calculateStats(filteredSales)
  const bestCustomer = Object.entries(stats.customerSales).sort(([, a], [, b]) => b.total - a.total)[0]

  const topProducts = Object.values(stats.productSales)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const handleExportExcel = () => {
    // Prepare summary data
    const summaryData = [
      ["Summary"],
      ["Total Sales", `৳${stats.totalSales.toLocaleString()}`],
      ["Total Transactions", stats.totalTransactions],
      ["Total Discounts", `৳${stats.totalDiscounts.toLocaleString()}`],
      [""],
      ["Top Products"],
      ["Product", "Quantity", "Total Sales"],
      ...topProducts.map((product) => [product.name, product.quantity, `৳${product.total.toLocaleString()}`]),
      [""],
      ["Transactions"],
    ]

    // Prepare transaction data
    const transactionData = filteredSales.map((sale) => ({
      Date: new Date(sale.createdAt).toLocaleDateString(),
      Invoice: sale.invoiceNo || "N/A",
      Customer: sale.customerName || "Walk-in",
      Amount: `৳${(sale.finalAmount || 0).toLocaleString()}`,
      Payment: sale.paymentMethod || "N/A",
    }))

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new()

    // Add summary sheet
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, "Summary")

    // Add transactions sheet
    const ws2 = XLSX.utils.json_to_sheet(transactionData)
    XLSX.utils.book_append_sheet(wb, ws2, "Transactions")

    // Save the file
    XLSX.writeFile(wb, `sales_report_${new Date().toISOString().split("T")[0]}.xlsx`)
    showToast("Excel file exported successfully")
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Daily Sales Report", 14, 22)

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
      ["Total Sales", `৳${stats.totalSales.toLocaleString()}`],
      ["Total Transactions", stats.totalTransactions.toString()],
      ["Total Discounts", `৳${stats.totalDiscounts.toLocaleString()}`],
      ["Best Customer", bestCustomer ? `${bestCustomer[0]} (৳${bestCustomer[1].total.toLocaleString()})` : "N/A"],
    ]

    doc.autoTable({
      startY: 50,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })

    // Add top products
    doc.text("Top Products", 14, doc.previousAutoTable.finalY + 15)

    const productData = topProducts.map((product) => [
      product.name,
      product.quantity.toString(),
      `৳${product.total.toLocaleString()}`,
    ])

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [["Product", "Quantity", "Total Sales"]],
      body: productData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })

    // Add transactions
    doc.text("Transactions", 14, doc.previousAutoTable.finalY + 15)

    const transactionData = filteredSales.map((sale) => [
      sale.invoiceNo || "N/A",
      sale.customerName || "Walk-in",
      `৳${(sale.finalAmount || 0).toLocaleString()}`,
      sale.paymentMethod || "N/A",
      new Date(sale.createdAt).toLocaleDateString(),
    ])

    doc.autoTable({
      startY: doc.previousAutoTable.finalY + 20,
      head: [["Invoice", "Customer", "Amount", "Payment", "Date"]],
      body: transactionData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
    })

    // Save the PDF
    doc.save(`daily_sales_report_${new Date().toISOString().split("T")[0]}.pdf`)
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
                <FiPackage className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daily Sales Report</h1>
              <p className="text-sm text-gray-500">Overview of your daily sales performance</p>
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
      <div className="grid gap-6 mb-6">
        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">৳{stats.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiPercent className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Discounts</p>
                <p className="text-2xl font-bold text-gray-900">৳{stats.totalDiscounts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FiStar className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Customer</p>
                {bestCustomer ? (
                  <>
                    <p className="text-lg font-bold text-gray-900 truncate">{bestCustomer[0]}</p>
                    <p className="text-sm text-gray-500">৳{bestCustomer[1].total.toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="text-blue-600" />
              Top Selling Products
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Barcode</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity Sold</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <div className="p-1.5 bg-amber-100 rounded-full">
                            <FiAward className="w-4 h-4 text-amber-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.barcode}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">৳{product.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Invoice</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
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
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                      </motion.tr>
                    ))
                  : filteredSales.map((sale) => (
                      <motion.tr
                        key={sale._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.invoiceNo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sale.customerName || "Walk-in"}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ৳{sale.finalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${
                            sale.paymentMethod === "cash"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                          >
                            {sale.paymentMethod || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString()}
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


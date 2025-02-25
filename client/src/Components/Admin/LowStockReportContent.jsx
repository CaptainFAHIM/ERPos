"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FaBox, FaSearch, FaFileExcel, FaPrint, FaExclamationTriangle, FaWarehouse } from "react-icons/fa"
import { Button, TextInput, Toast, Modal, Spinner } from "flowbite-react"
import { HiX } from "react-icons/hi"
import * as XLSX from "xlsx"

export default function PremiumLowStockReport() {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showExportModal, setShowExportModal] = useState(false)
  const [stats, setStats] = useState({
    criticalCount: 0,
    warningCount: 0,
    totalLowStock: 0,
  })

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:4000/api/lowstock/low-stock")
      setLowStockProducts(response.data.products)

      const stats = response.data.products.reduce(
        (acc, product) => {
          if (product.totalQuantity <= 5) {
            acc.criticalCount++
          } else if (product.totalQuantity <= 10) {
            acc.warningCount++
          }
          return acc
        },
        { criticalCount: 0, warningCount: 0, totalLowStock: response.data.lowStockCount },
      )
      setStats(stats)
    } catch (error) {
      setError("Failed to fetch low stock products")
      showToast("Failed to fetch low stock products", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLowStockProducts()
  }, [fetchLowStockProducts])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const handleExport = () => {
    const exportData = lowStockProducts.map((product) => ({
      Description: product.description,
      Barcode: product.barcode,
      "Current Stock": product.totalQuantity,
      Status: product.totalQuantity <= 5 ? "Critical" : "Warning",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "LowStock")
    XLSX.writeFile(workbook, `low_stock_report_${new Date().toISOString().split("T")[0]}.xlsx`)
    setShowExportModal(false)
    showToast("Report exported successfully")
  }

  const handlePrint = () => {
    window.print()
  }

  const filteredProducts = lowStockProducts.filter(
    (product) =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                <FaWarehouse className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Low Stock Report</h1>
              <p className="text-sm text-gray-500">Monitor and manage inventory levels</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <FaFileExcel className="w-5 h-5 mr-2" />
              Export
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              <FaPrint className="w-5 h-5 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl shadow-lg border border-red-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-2xl text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Critical Stock</p>
                <p className="text-3xl font-bold text-red-900">{stats.criticalCount}</p>
                <p className="text-xs text-red-700">Items with stock ≤ 5</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-yellow-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaBox className="text-2xl text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Warning Level</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.warningCount}</p>
                <p className="text-xs text-yellow-700">Items with stock ≤ 10</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaWarehouse className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Total Low Stock</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalLowStock}</p>
                <p className="text-xs text-blue-700">Items needing attention</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput
            type="search"
            placeholder="Search by product name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full lg:w-1/3"
          />
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Barcode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Current Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      <Spinner size="xl" />
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No low stock products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{product.description}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.barcode}</td>
                      <td className="px-6 py-4 text-gray-600">{product.totalQuantity}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.totalQuantity <= 5 ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.totalQuantity <= 5 ? "Critical" : "Warning"}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Export Confirmation Modal */}
      <Modal show={showExportModal} onClose={() => setShowExportModal(false)}>
        <Modal.Header>Confirm Export</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to export the low stock report?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowExportModal(false)}>Cancel</Button>
          <Button color="success" onClick={handleExport}>
            Export
          </Button>
        </Modal.Footer>
      </Modal>

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
                <FaExclamationTriangle className="w-5 h-5" />
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

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .overflow-x-auto,
          .overflow-x-auto * {
            visibility: visible;
          }
          .overflow-x-auto {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}


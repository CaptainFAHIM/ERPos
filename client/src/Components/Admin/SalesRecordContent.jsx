"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Table, Button, Modal, TextInput, Select, Spinner, Toast } from "flowbite-react"
import {
  FiEdit2,
  FiTrash2,
  FiFileText,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiPhone,
  FiDollarSign,
  FiShoppingCart,
  FiPercent,
  FiHash,
  FiAlertCircle,
  FiDownload,
  FiBarChart2,
  FiTrendingUp,
} from "react-icons/fi"
import { HiX } from "react-icons/hi"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import axios from "axios"
import Barcode from "react-barcode"
import jsPDF from "jspdf"
import "jspdf-autotable"

const API_BASE_URL = "http://localhost:4000/api"

export default function SalesRecordContent() {
  // ... previous state declarations ...
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [sales, setSales] = useState([])
  const [error, setError] = useState(null)
  const [editingSale, setEditingSale] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`)
      setSales(response.data)
      showToast("Sales data loaded successfully")
    } catch (err) {
      console.error("Error fetching sales data:", err)
      setError("Failed to fetch sales data. Please try again.")
      showToast("Failed to fetch sales data", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSale = (sale) => {
    setEditingSale(sale)
    setShowEditModal(true)
  }

  const handleUpdateSale = async () => {
    try {
      await axios.put(`${API_BASE_URL}/sales/${editingSale._id}`, editingSale)
      setShowEditModal(false)
      fetchSales()
      showToast("Sale updated successfully")
    } catch (err) {
      console.error("Error updating sale:", err)
      showToast("Failed to update sale", "error")
    }
  }

  const handleDeleteSale = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/sales/${deletingId}`)
      fetchSales()
      setShowDeleteModal(false)
      setDeletingId(null)
      showToast("Sale deleted successfully")
    } catch (err) {
      console.error("Error deleting sale:", err)
      showToast("Failed to delete sale", "error")
    }
  }

  const handleViewInvoice = (sale) => {
    setSelectedInvoice(sale)
    setShowInvoiceModal(true)
  }

  const handleExportInvoicePDF = () => {
    if (!selectedInvoice) return

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("Sales Invoice", 14, 22)

    // Add invoice details
    doc.setFontSize(11)
    doc.text(`Invoice No: ${selectedInvoice.invoiceNo}`, 14, 32)
    doc.text(`Transaction No: ${selectedInvoice.transactionNo}`, 14, 40)
    doc.text(`Customer: ${selectedInvoice.customerName}`, 14, 48)
    doc.text(`Date: ${new Date(selectedInvoice.createdAt).toLocaleDateString()}`, 14, 56)

    // Add products table
    doc.autoTable({
      startY: 70,
      head: [["Product", "Quantity", "Price"]],
      body: selectedInvoice.products.map((product) => [
        product.productId.description,
        product.quantity,
        `৳${product.totalPrice.toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    // Add totals
    const finalY = doc.lastAutoTable.finalY + 10
    doc.text(`Total Amount: ৳${selectedInvoice.totalAmount.toFixed(2)}`, 14, finalY)
    doc.text(`Discount: ৳${selectedInvoice.discount.toFixed(2)}`, 14, finalY + 8)
    doc.text(`Final Amount: ৳${selectedInvoice.finalAmount.toFixed(2)}`, 14, finalY + 16)

    // Save the PDF
    doc.save(`invoice-${selectedInvoice.invoiceNo}.pdf`)
  }

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt)
    const matchesSearch =
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.transactionNo.toString().includes(searchTerm)
    const matchesFilter = filterStatus === "all" || sale.paymentMethod === filterStatus
    const matchesDateRange =
      (!startDate || saleDate >= new Date(startDate)) && (!endDate || saleDate <= new Date(endDate))
    return matchesSearch && matchesFilter && matchesDateRange
  })

  const salesData = sales.map((sale) => ({
    date: new Date(sale.createdAt).toLocaleDateString(),
    amount: sale.finalAmount,
  }))

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
                  <FiFileText className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sales Records</h1>
                <p className="text-sm text-gray-500">Manage and track your sales</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sales Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiBarChart2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Daily Sales</h2>
            </div>
            <div className="h-72 bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} barGap={10} barCategoryGap={20}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#374151", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
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

          {/* Sales Trend Chart */}
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
              <h2 className="text-xl font-semibold text-gray-900">Sales Trend</h2>
            </div>
            <div className="h-72 bg-gray-50 rounded-xl p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#374151", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#374151", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="url(#greenGradient)"
                    strokeWidth={3}
                    dot={{ fill: "#10b981" }}
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
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
          <div className="flex-1">
            <TextInput
              icon={FiSearch}
              placeholder="Search by customer or transaction number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select icon={FiFilter} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <TextInput
              type="date"
              icon={FiCalendar}
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <TextInput
              type="date"
              icon={FiCalendar}
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Sales Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Spinner size="xl" className="mb-4" />
              <p className="text-gray-500">Loading sales data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <div className="max-h-[500px] overflow-y-auto">
                <Table striped>
                  <Table.Head className="sticky top-0 bg-white">
                    <Table.HeadCell>Transaction No</Table.HeadCell>
                    <Table.HeadCell>Invoice No</Table.HeadCell>
                    <Table.HeadCell>Customer</Table.HeadCell>
                    <Table.HeadCell>Date</Table.HeadCell>
                    <Table.HeadCell>Amount</Table.HeadCell>
                    <Table.HeadCell>Payment Method</Table.HeadCell>
                    <Table.HeadCell>Actions</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredSales.map((sale) => (
                      <Table.Row key={sale._id} className="hover:bg-gray-50 transition-colors">
                        <Table.Cell>{sale.transactionNo}</Table.Cell>
                        <Table.Cell>{sale.invoiceNo}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                              <FiUser className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">{sale.customerName}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{new Date(sale.createdAt).toLocaleDateString()}</Table.Cell>
                        <Table.Cell className="font-semibold text-blue-600">
                          ৳{sale.finalAmount?.toFixed(2) ?? "N/A"}
                        </Table.Cell>
                        <Table.Cell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sale.paymentMethod === "cash"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {sale.paymentMethod}
                          </span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditSale(sale)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setDeletingId(sale._id)
                                setShowDeleteModal(true)
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-0"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewInvoice(sale)}
                              className="bg-green-50 hover:bg-green-100 text-green-600 border-0"
                            >
                              <FiFileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit Sale Modal */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} className="backdrop-blur-sm">
          <Modal.Header className="border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Edit Sale</h3>
          </Modal.Header>
          <Modal.Body>
            {editingSale && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <TextInput
                    icon={FiUser}
                    value={editingSale.customerName}
                    onChange={(e) => setEditingSale({ ...editingSale, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
                  <TextInput
                    icon={FiPhone}
                    value={editingSale.customerNumber}
                    onChange={(e) => setEditingSale({ ...editingSale, customerNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <TextInput
                    icon={FiPercent}
                    type="number"
                    value={editingSale.discount}
                    onChange={(e) => setEditingSale({ ...editingSale, discount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <Select
                    icon={FiDollarSign}
                    value={editingSale.paymentMethod}
                    onChange={(e) => setEditingSale({ ...editingSale, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </Select>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-100">
            <div className="flex justify-end gap-2">
              <Button color="gray" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSale}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                Update Sale
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

        {/* View Invoice Modal */}
        <Modal
          show={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          size="xl"
          className="backdrop-blur-sm"
        >
          <Modal.Header className="border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Invoice Details</h3>
            </div>
          </Modal.Header>
          <Modal.Body>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="flex justify-center mb-4">
                  <Barcode value={selectedInvoice.transactionNo.toString()} width={2} height={50} fontSize={14} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiHash className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Invoice No</p>
                        <p className="font-semibold">{selectedInvoice.invoiceNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiUser className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-semibold">{selectedInvoice.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiPhone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-semibold">{selectedInvoice.customerNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold">৳{selectedInvoice.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiPercent className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Discount</p>
                        <p className="font-semibold">৳{selectedInvoice.discount?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FiDollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Final Amount</p>
                        <p className="font-semibold">৳{selectedInvoice.finalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h6 className="font-semibold flex items-center gap-2 mb-4">
                    <FiShoppingCart className="text-blue-600" />
                    Products
                  </h6>
                  <div className="bg-gray-50 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Product</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Quantity</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.products.map((product, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">{product.productId.description}</td>
                            <td className="px-4 py-3">{product.quantity}</td>
                            <td className="px-4 py-3">৳{product.totalPrice?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-t border-gray-100">
            <div className="flex justify-end gap-2">
              <Button color="gray" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
              <Button
                onClick={handleExportInvoicePDF}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </Modal.Footer>
        </Modal>

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
              <p>Are you sure you want to delete this sale? This action cannot be undone.</p>
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
              <Button onClick={handleDeleteSale} className="bg-red-500 hover:bg-red-600 text-white border-0">
                Delete
              </Button>
            </div>
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


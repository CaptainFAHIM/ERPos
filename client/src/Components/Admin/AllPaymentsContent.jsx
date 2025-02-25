"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  FiSearch,
  FiTrash2,
  FiDollarSign,
  FiChevronDown,
  FiChevronRight,
  FiAlertCircle,
  FiCreditCard,
  FiBox,
} from "react-icons/fi"
import { FileText } from "lucide-react"
import { Button, TextInput, Modal, Badge, Toast, Table } from "flowbite-react"
import { HiX } from "react-icons/hi"
import JsBarcode from "jsbarcode"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import React from "react"
import * as XLSX from "xlsx"

export default function AllPaymentsContent() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  const generatePDF = () => {
    try {
      const doc = new jsPDF()

      // Add title with styling
      doc.setFontSize(20)
      doc.setTextColor(41, 128, 185)
      doc.text("Payment Report", 15, 15)

      // Add subtitle with date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 25)

      // Add summary table
      const tableData = filteredPayments.map((payment) => [
        formatDate(payment.createdAt),
        payment.invoiceNumber,
        payment.supplier?.name || "N/A",
        `Tk ${payment.totalAmount?.toFixed(2)}`,
        `Tk ${payment.paidAmount?.toFixed(2)}`,
        `Tk ${payment.dueAmount?.toFixed(2)}`,
        payment.paymentMethod,
        payment.status,
      ])

      // Add main payments table
      autoTable(doc, {
        head: [["Date", "Invoice", "Supplier", "Total", "Paid", "Due", "Method", "Status"]],
        body: tableData,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      })

      // Add product details for each payment
      let yPos = doc.lastAutoTable.finalY + 10

      filteredPayments.forEach((payment, index) => {
        // Add some spacing between payments
        if (index > 0) yPos += 10

        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }

        // Add payment header
        doc.setFontSize(12)
        doc.setTextColor(41, 128, 185)
        doc.text(`Products for Invoice: ${payment.invoiceNumber}`, 15, yPos)

        // Prepare product data
        const productData = payment.products.map((product) => [
          product.product?.name || "N/A",
          product.quantity.toString(),
          `Tk ${product.unitPrice?.toFixed(2)}`,
          `Tk ${product.sellPrice?.toFixed(2)}`,
          `Tk ${(product.quantity * product.unitPrice)?.toFixed(2)}`,
        ])

        // Add products table
        autoTable(doc, {
          head: [["Product", "Qty", "Unit Price", "Sell Price", "Total"]],
          body: productData,
          startY: yPos + 5,
          styles: { fontSize: 8 },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
        })

        yPos = doc.lastAutoTable.finalY + 10
      })

      // Add footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, {
          align: "right",
        })
      }

      // Save the PDF
      doc.save("payment-report.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      showToast("Failed to generate PDF", "error")
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:4000/api/payments")
      setPayments(response.data)
      setFilteredPayments(response.data)
    } catch (error) {
      console.error("Error fetching payments:", error)
      showToast("Failed to fetch payments", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = payments.filter((payment) => {
      const matchesSearch =
        payment.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.products?.some((product) => product.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()))

      const paymentDate = new Date(payment.createdAt)
      const matchesDateRange =
        (!startDate || paymentDate >= new Date(startDate)) && (!endDate || paymentDate <= new Date(endDate))
      return matchesSearch && matchesDateRange
    })
    setFilteredPayments(filtered)
  }, [searchTerm, payments, startDate, endDate])

  const handleDelete = async (paymentId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this payment? This will update product quantities and supplier due amounts.",
      )
    ) {
      setLoading(true)
      try {
        await axios.delete(`http://localhost:4000/api/payments/${paymentId}`)
        showToast("Payment deleted successfully")
        fetchPayments()
      } catch (error) {
        console.error("Error deleting payment:", error)
        showToast("Failed to delete payment", "error")
      } finally {
        setLoading(false)
      }
    }
  }

  const handlePayDue = async () => {
    if (!selectedPayment || !paymentAmount) return

    try {
      await axios.put(`http://localhost:4000/api/payments/${selectedPayment._id}`, {
        paidAmount: Number(selectedPayment.paidAmount) + Number(paymentAmount),
        totalAmount: selectedPayment.totalAmount,
        products: selectedPayment.products,
      })

      showToast("Payment updated successfully")
      setShowPayModal(false)
      setPaymentAmount("")
      fetchPayments()
    } catch (error) {
      console.error("Error updating payment:", error)
      showToast("Failed to update payment", "error")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleRowExpansion = (paymentId) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(paymentId)) {
      newExpandedRows.delete(paymentId)
    } else {
      newExpandedRows.add(paymentId)
    }
    setExpandedRows(newExpandedRows)
  }

  const handlePrint = () => {
    const printContent = document.getElementById("printable-content").innerHTML
    const originalContent = document.body.innerHTML
    document.body.innerHTML = `
      <html>
        <head>
          <title>Payment Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .nested-row { background-color: #f9f9f9; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Payment Report</h1>
          ${printContent}
        </body>
      </html>
    `
    window.print()
    document.body.innerHTML = originalContent
  }

  const handleExcelExport = () => {
    const dataToExport = filteredPayments.map((payment) => ({
      Date: formatDate(payment.createdAt),
      "Invoice Number": payment.invoiceNumber,
      Supplier: payment.supplier?.name || "N/A",
      "Total Amount": payment.totalAmount,
      "Paid Amount": payment.paidAmount,
      "Due Amount": payment.dueAmount,
      "Payment Method": payment.paymentMethod,
      Status: payment.status,
      Notes: payment.notes,
      Products: payment.products.map((p) => `${p.product?.name} (${p.quantity} x Tk${p.unitPrice})`).join("; "),
    }))

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments")
    XLSX.writeFile(workbook, "payments_export.xlsx")
  }

  const generateBarcode = (invoiceNumber) => {
    const canvas = document.createElement("canvas")
    JsBarcode(canvas, invoiceNumber, { format: "CODE128" })
    return canvas.toDataURL("image/png")
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
              <div className="absolute inset-0 bg-emerald-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Payments</h1>
              <p className="text-sm text-gray-500">Manage and track all payment records</p>
            </div>
          </div>
          <Button
            onClick={generatePDF}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
          >
            <FileText className="w-4 h-4 mr-2" /> Export PDF
          </Button>
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
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <TextInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <Table.Head className="bg-gray-50/50">
              <Table.HeadCell className="font-semibold">Date</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Invoice</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Supplier</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Products</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Total</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Paid</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Due</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Method</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Status</Table.HeadCell>
              <Table.HeadCell className="font-semibold">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <Table.Row key={`skeleton-${index}`} className="animate-pulse">
                        {[...Array(10)].map((_, cellIndex) => (
                          <Table.Cell key={cellIndex}>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))
                  : filteredPayments.map((payment) => (
                      <React.Fragment key={payment._id}>
                        <Table.Row className="hover:bg-gray-50/50 transition-colors">
                          <Table.Cell className="text-sm">{formatDate(payment.createdAt)}</Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{payment.invoiceNumber}</span>
                              <img
                                src={generateBarcode(payment.invoiceNumber) || "/placeholder.svg"}
                                alt="Barcode"
                                className="h-8"
                              />
                            </div>
                          </Table.Cell>
                          <Table.Cell className="font-medium">{payment.supplier?.name || "N/A"}</Table.Cell>
                          <Table.Cell>
                            <Button
                              size="xs"
                              onClick={() => toggleRowExpansion(payment._id)}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-600 border-0 flex items-center gap-1"
                            >
                              {expandedRows.has(payment._id) ? (
                                <FiChevronDown className="w-4 h-4" />
                              ) : (
                                <FiChevronRight className="w-4 h-4" />
                              )}
                              {payment.products.length} Products
                            </Button>
                          </Table.Cell>
                          <Table.Cell>Tk {payment.totalAmount?.toFixed(2)}</Table.Cell>
                          <Table.Cell>Tk {payment.paidAmount?.toFixed(2)}</Table.Cell>
                          <Table.Cell>Tk {payment.dueAmount?.toFixed(2)}</Table.Cell>
                          <Table.Cell>
                            <span className="flex items-center gap-1">
                              <FiCreditCard className="w-4 h-4 text-gray-400" />
                              {payment.paymentMethod}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              className={`
                              ${payment.status === "Paid" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}
                            `}
                            >
                              {payment.status}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2">
                              {payment.dueAmount > 0 && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(payment)
                                    setShowPayModal(true)
                                  }}
                                  className="bg-green-50 hover:bg-green-100 text-green-600 border-0"
                                >
                                  Pay
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleDelete(payment._id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-0"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </Table.Row>
                        {expandedRows.has(payment._id) && (
                          <Table.Row>
                            <Table.Cell colSpan={10} className="p-4 bg-gray-50/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {payment.products.map((product, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="bg-gray-100 p-3 rounded-lg">
                                        <FiBox className="w-6 h-6 text-gray-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{product.product?.name}</h4>
                                        <div className="mt-1 grid grid-cols-2 gap-2">
                                          <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="text-sm font-medium text-gray-900">
                                              {product.quantity} units
                                            </p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Unit Price</p>
                                            <p className="text-sm font-medium text-gray-900">
                                              Tk {product.unitPrice?.toFixed(2)}
                                            </p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Sell Price</p>
                                            <p className="text-sm font-medium text-gray-900">
                                              Tk {product.sellPrice?.toFixed(2)}
                                            </p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="text-sm font-medium text-emerald-600">
                                              Tk {(product.quantity * product.unitPrice)?.toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </React.Fragment>
                    ))}
              </AnimatePresence>
            </Table.Body>
          </Table>
        </div>
      </motion.div>

      {/* Pay Due Modal */}
      <Modal show={showPayModal} onClose={() => setShowPayModal(false)} className="backdrop-blur-sm">
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Pay Due Amount</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Due Amount</p>
              <p className="text-2xl font-semibold text-gray-900">Tk {selectedPayment?.dueAmount?.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Amount</label>
              <TextInput
                type="number"
                placeholder="Enter amount to pay"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedPayment?.dueAmount}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={() => setShowPayModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayDue}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
            >
              Confirm Payment
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
  )
}


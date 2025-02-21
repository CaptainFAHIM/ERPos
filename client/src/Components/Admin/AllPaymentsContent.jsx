"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Table, Button, TextInput, Spinner, Modal, Badge } from "flowbite-react"
import { FaTrash, FaSearch, FaPrint, FaFileExcel, FaChevronDown, FaChevronRight, FaEdit } from "react-icons/fa"
import * as XLSX from "xlsx"
import JsBarcode from "jsbarcode"

export default function AllPaymentsContent() {
  const [payments, setPayments] = useState([])
  const [filteredPayments, setFilteredPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [expandedRows, setExpandedRows] = useState(new Set())

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost:4000/api/payments")
      setPayments(response.data)
      setFilteredPayments(response.data)
    } catch (error) {
      console.error("Error fetching payments:", error)
      setPayments([])
      setFilteredPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filtered = payments.filter((payment) => {
      const matchesSearch =
        payment.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.products?.some(
          (product) =>
            product.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )

      const paymentDate = new Date(payment.createdAt)
      const matchesDateRange =
        (!startDate || paymentDate >= new Date(startDate)) && (!endDate || paymentDate <= new Date(endDate))
      return matchesSearch && matchesDateRange
    })
    setFilteredPayments(filtered)
  }, [searchTerm, payments, startDate, endDate])

  const handleDelete = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment? This will update product quantities and supplier due amounts.")) {
      setIsLoading(true)
      try {
        await axios.delete(`http://localhost:4000/api/payments/${paymentId}`)
        fetchPayments()
      } catch (error) {
        console.error("Error deleting payment:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePayDue = async () => {
    if (!selectedPayment || !paymentAmount) return

    try {
      const response = await axios.put(`http://localhost:4000/api/payments/${selectedPayment._id}`, {
        paidAmount: Number(selectedPayment.paidAmount) + Number(paymentAmount),
        totalAmount: selectedPayment.totalAmount,
        products: selectedPayment.products // Keep existing products
      })

      setShowPayModal(false)
      setPaymentAmount("")
      fetchPayments()
    } catch (error) {
      console.error("Error updating payment:", error)
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
      Products: payment.products
        .map((p) => `${p.product?.name} (${p.quantity} x Tk${p.unitPrice})`)
        .join("; ")
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
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">All Payments</h1>
        <div className="flex space-x-2">
          <Button onClick={handlePrint}>
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button onClick={handleExcelExport}>
            <FaFileExcel className="mr-2" /> Export to Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <TextInput
          type="text"
          placeholder="Search by supplier, invoice, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FaSearch}
        />
        <TextInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <TextInput 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
          placeholder="End Date" 
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto" id="printable-content">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Invoice Number</Table.HeadCell>
              <Table.HeadCell>Supplier</Table.HeadCell>
              <Table.HeadCell>Products</Table.HeadCell>
              <Table.HeadCell>Total Amount</Table.HeadCell>
              <Table.HeadCell>Paid Amount</Table.HeadCell>
              <Table.HeadCell>Due Amount</Table.HeadCell>
              <Table.HeadCell>Payment Method</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredPayments.map((payment) => (
                <>
                  <Table.Row key={payment._id} className="bg-white">
                    <Table.Cell>{formatDate(payment.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <span>{payment.invoiceNumber}</span>
                        <img
                          src={generateBarcode(payment.invoiceNumber) || "/placeholder.svg"}
                          alt="Barcode"
                          className="h-8"
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell>{payment.supplier?.name || "N/A"}</Table.Cell>
                    <Table.Cell>
                      <Button
                        size="xs"
                        color="light"
                        onClick={() => toggleRowExpansion(payment._id)}
                        className="flex items-center"
                      >
                        {expandedRows.has(payment._id) ? <FaChevronDown /> : <FaChevronRight />}
                        <span className="ml-2">{payment.products.length} Products</span>
                      </Button>
                    </Table.Cell>
                    <Table.Cell>Tk {payment.totalAmount?.toFixed(2)}</Table.Cell>
                    <Table.Cell>Tk {payment.paidAmount?.toFixed(2)}</Table.Cell>
                    <Table.Cell>Tk {payment.dueAmount?.toFixed(2)}</Table.Cell>
                    <Table.Cell>{payment.paymentMethod}</Table.Cell>
                    <Table.Cell>
                      <Badge color={payment.status === "Paid" ? "success" : "warning"}>
                        {payment.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        {payment.dueAmount > 0 && (
                          <Button 
                            color="success" 
                            size="sm" 
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowPayModal(true)
                            }}
                          >
                            Pay
                          </Button>
                        )}
                        <Button 
                          color="failure" 
                          size="sm" 
                          onClick={() => handleDelete(payment._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                  {expandedRows.has(payment._id) && (
                    <Table.Row className="bg-gray-50">
                      <Table.Cell colSpan={10}>
                        <Table>
                          <Table.Head>
                            <Table.HeadCell>Product Name</Table.HeadCell>
                            <Table.HeadCell>Quantity</Table.HeadCell>
                            <Table.HeadCell>Unit Price</Table.HeadCell>
                            <Table.HeadCell>Sell Price</Table.HeadCell>
                            <Table.HeadCell>Total</Table.HeadCell>
                          </Table.Head>
                          <Table.Body>
                            {payment.products.map((product, index) => (
                              <Table.Row key={index}>
                                <Table.Cell>{product.product?.name}</Table.Cell>
                                <Table.Cell>{product.quantity}</Table.Cell>
                                <Table.Cell>Tk {product.unitPrice?.toFixed(2)}</Table.Cell>
                                <Table.Cell>Tk {product.sellPrice?.toFixed(2)}</Table.Cell>
                                <Table.Cell>
                                  Tk {(product.quantity * product.unitPrice)?.toFixed(2)}
                                </Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Pay Due Modal */}
      <Modal show={showPayModal} onClose={() => setShowPayModal(false)}>
        <Modal.Header>Pay Due Amount</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>Current Due Amount: Tk {selectedPayment?.dueAmount?.toFixed(2)}</p>
            <TextInput
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              max={selectedPayment?.dueAmount}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePayDue}>Submit Payment</Button>
          <Button color="gray" onClick={() => setShowPayModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
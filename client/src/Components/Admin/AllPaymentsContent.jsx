"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Table, Button, TextInput, Spinner, Modal } from "flowbite-react"
import { FaEdit, FaTrash, FaSearch, FaPrint, FaFileExcel } from "react-icons/fa"
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
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [editedPayment, setEditedPayment] = useState(null)

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
      const matchesSearch = Object.values(payment).some((value) =>
        value && typeof value === "object"
          ? Object.values(value).some((v) => v && v.toString().toLowerCase().includes(searchTerm.toLowerCase()))
          : value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      )
      const paymentDate = new Date(payment.createdAt)
      const matchesDateRange =
        (!startDate || paymentDate >= new Date(startDate)) && (!endDate || paymentDate <= new Date(endDate))
      return matchesSearch && matchesDateRange
    })
    setFilteredPayments(filtered)
  }, [searchTerm, payments, startDate, endDate])

  const handleDelete = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
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
    const dataToExport = filteredPayments.map(({ _id, __v, createdAt, updatedAt, ...rest }) => ({
      ...rest,
      supplier: rest.supplier?.name || "N/A",
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

  const handlePayDue = (payment) => {
    setSelectedPayment(payment)
    setShowPayModal(true)
  }

  const handleEdit = (payment) => {
    setEditedPayment({ ...payment })
    setShowEditModal(true)
  }

  const handlePaymentSubmit = async () => {
    if (!selectedPayment || !paymentAmount) return

    try {
      const response = await axios.put(`http://localhost:4000/api/payments/${selectedPayment._id}`, {
        paidAmount: Number(selectedPayment.paidAmount) + Number(paymentAmount),
        dueAmount: Math.max(0, Number(selectedPayment.dueAmount) - Number(paymentAmount)),
      })

      setShowPayModal(false)
      setPaymentAmount("")
      fetchPayments()
    } catch (error) {
      console.error("Error updating payment:", error)
    }
  }

  const handleEditSubmit = async () => {
    if (!editedPayment) return

    try {
      await axios.put(`http://localhost:4000/api/payments/${editedPayment._id}`, editedPayment)
      setShowEditModal(false)
      fetchPayments()
    } catch (error) {
      console.error("Error updating payment:", error)
    }
  }

  return (
    <div className="container mx-auto max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
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
          placeholder="Search payments..."
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
        <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End Date" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          {filteredPayments.length === 0 && <div className="text-center py-4">No payments found</div>}
          <div className="overflow-x-auto" id="printable-content">
            <Table striped>
              <Table.Head>
                <Table.HeadCell>No.</Table.HeadCell>
                <Table.HeadCell>Supplier</Table.HeadCell>
                <Table.HeadCell>Product</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
                <Table.HeadCell>Unit Price</Table.HeadCell>
                <Table.HeadCell>Total Price</Table.HeadCell>
                <Table.HeadCell>Paid Amount</Table.HeadCell>
                <Table.HeadCell>Due Amount</Table.HeadCell>
                <Table.HeadCell>Payment Method</Table.HeadCell>
                <Table.HeadCell>Invoice Number</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredPayments.map((payment, index) => (
                  <Table.Row key={payment._id}>
                    <Table.Cell>{index + 1}</Table.Cell>
                    <Table.Cell>{payment.supplier?.name || "N/A"}</Table.Cell>
                    <Table.Cell>{payment.product}</Table.Cell>
                    <Table.Cell>{payment.quantity}</Table.Cell>
                    <Table.Cell>Tk {payment.unitPrice?.toFixed(2) ?? "N/A"}</Table.Cell>
                    <Table.Cell>Tk {payment.totalPrice?.toFixed(2) ?? "N/A"}</Table.Cell>
                    <Table.Cell>Tk {payment.paidAmount?.toFixed(2) ?? "N/A"}</Table.Cell>
                    <Table.Cell>Tk {payment.dueAmount?.toFixed(2) ?? "N/A"}</Table.Cell>
                    <Table.Cell>{payment.paymentMethod}</Table.Cell>
                    <Table.Cell>
                      {payment.invoiceNumber}
                      <img
                        src={generateBarcode(payment.invoiceNumber) || "/placeholder.svg"}
                        alt="Barcode"
                        className="h-8 ml-2"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        {payment.dueAmount > 0 && (
                          <Button color="success" size="sm" onClick={() => handlePayDue(payment)}>
                            Pay 
                          </Button>
                        )}
                        <Button color="info" size="sm" onClick={() => handleEdit(payment)}>
                          <FaEdit />
                        </Button>
                       
                        <Button color="failure" size="sm" onClick={() => handleDelete(payment._id)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </>
      )}

      <Modal show={showPayModal} onClose={() => setShowPayModal(false)}>
        <Modal.Header>Pay Due Amount</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>Current Due Amount: Tk {selectedPayment?.dueAmount.toFixed(2)}</p>
            <TextInput
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePaymentSubmit}>Submit Payment</Button>
          <Button color="gray" onClick={() => setShowPayModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit Payment</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              label="Product"
              value={editedPayment?.product || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, product: e.target.value })}
            />
            <TextInput
              label="Quantity"
              type="number"
              value={editedPayment?.quantity || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, quantity: e.target.value })}
            />
            <TextInput
              label="Unit Price"
              type="number"
              value={editedPayment?.unitPrice || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, unitPrice: e.target.value })}
            />
            <TextInput
              label="Total Price"
              type="number"
              value={editedPayment?.totalPrice || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, totalPrice: e.target.value })}
            />
            <TextInput
              label="Paid Amount"
              type="number"
              value={editedPayment?.paidAmount || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, paidAmount: e.target.value })}
            />
            <TextInput
              label="Due Amount"
              type="number"
              value={editedPayment?.dueAmount || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, dueAmount: e.target.value })}
            />
            <TextInput
              label="Payment Method"
              value={editedPayment?.paymentMethod || ""}
              onChange={(e) => setEditedPayment({ ...editedPayment, paymentMethod: e.target.value })}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleEditSubmit}>Save Changes</Button>
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


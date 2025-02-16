"use client"

import { useState, useEffect } from "react"
import { Table, Button, Modal, TextInput, Select, Card, Spinner } from "flowbite-react"
import {
  FaEdit,
  FaTrash,
  FaFileInvoice,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaPhone,
  FaMoneyBillWave,
  FaShoppingCart,
  FaPercent,
  FaBarcode,
} from "react-icons/fa"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import axios from "axios"
import Barcode from "react-barcode" // Import Barcode component

const API_BASE_URL = "http://localhost:4000/api"

export default function SalesRecordContent() {
  const [sales, setSales] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingSale, setEditingSale] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`)
      setSales(response.data)
    } catch (err) {
      console.error("Error fetching sales data:", err)
      setError("Failed to fetch sales data. Please try again.")
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
    } catch (err) {
      console.error("Error updating sale:", err)
      setError("Failed to update sale. Please try again.")
    }
  }

  const handleDeleteSale = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await axios.delete(`${API_BASE_URL}/sales/${id}`)
        fetchSales()
      } catch (err) {
        console.error("Error deleting sale:", err)
        setError("Failed to delete sale. Please try again.")
      }
    }
  }

  const handleViewInvoice = (sale) => {
    setSelectedInvoice(sale)
    setShowInvoiceModal(true)
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales Records</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h5 className="text-xl font-bold mb-2">Daily Sales</h5>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h5 className="text-xl font-bold mb-2">Sales Trend</h5>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <TextInput
              icon={FaSearch}
              placeholder="Search by customer or transaction number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select icon={FaFilter} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <TextInput
              type="date"
              icon={FaCalendarAlt}
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <TextInput
              type="date"
              icon={FaCalendarAlt}
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
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
                    <Table.Row key={sale._id}>
                      <Table.Cell>{sale.transactionNo}</Table.Cell>
                      <Table.Cell>{sale.invoiceNo}</Table.Cell>
                      <Table.Cell>{sale.customerName}</Table.Cell>
                      <Table.Cell>{new Date(sale.createdAt).toLocaleDateString()}</Table.Cell>
                      <Table.Cell>Tk {sale.finalAmount?.toFixed(2) ?? "N/A"}</Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-2 py-1 rounded ${
                            sale.paymentMethod === "cash" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {sale.paymentMethod}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <Button color="info" size="xs" onClick={() => handleEditSale(sale)} className="rounded-full">
                            <FaEdit />
                          </Button>
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => handleDeleteSale(sale._id)}
                            className="rounded-full"
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            color="success"
                            size="xs"
                            onClick={() => handleViewInvoice(sale)}
                            className="rounded-full"
                          >
                            <FaFileInvoice />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Sale Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit Sale</Modal.Header>
        <Modal.Body>
          {editingSale && (
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block mb-2 font-bold text-gray-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={editingSale.customerName}
                  onChange={(e) => setEditingSale({ ...editingSale, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="customerNumber" className="block mb-2 font-bold text-gray-700">
                  Customer Number
                </label>
                <input
                  type="text"
                  id="customerNumber"
                  name="customerNumber"
                  value={editingSale.customerNumber}
                  onChange={(e) => setEditingSale({ ...editingSale, customerNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="discount" className="block mb-2 font-bold text-gray-700">
                  Discount
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={editingSale.discount}
                  onChange={(e) => setEditingSale({ ...editingSale, discount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="paymentMethod" className="block mb-2 font-bold text-gray-700">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={editingSale.paymentMethod}
                  onChange={(e) => setEditingSale({ ...editingSale, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleUpdateSale}>Update</Button>
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Invoice Modal */}
      <Modal show={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} size="xl">
        <Modal.Header>Invoice Details</Modal.Header>
        <Modal.Body>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <Barcode value={selectedInvoice.transactionNo.toString()} width={2} height={50} fontSize={14} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex items-center">
                    <FaFileInvoice className="mr-2 text-blue-500" />
                    <strong>Invoice No:</strong> {selectedInvoice.invoiceNo}
                  </p>
                  <p className="flex items-center">
                    <FaBarcode className="mr-2 text-blue-500" />
                    <strong>Transaction No:</strong> {selectedInvoice.transactionNo}
                  </p>
                  <p className="flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    <strong>Customer Name:</strong> {selectedInvoice.customerName}
                  </p>
                  <p className="flex items-center">
                    <FaPhone className="mr-2 text-blue-500" />
                    <strong>Customer Number:</strong> {selectedInvoice.customerNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    <strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleString()}
                  </p>
                  <p className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-blue-500" />
                    <strong>Payment Method:</strong> {selectedInvoice.paymentMethod}
                  </p>
                  <p className="flex items-center">
                    <FaShoppingCart className="mr-2 text-blue-500" />
                    <strong>Total Amount:</strong> Tk {selectedInvoice.totalAmount?.toFixed(2)}
                  </p>
                  <p className="flex items-center">
                    <FaPercent className="mr-2 text-blue-500" />
                    <strong>Discount:</strong> Tk {selectedInvoice.discount?.toFixed(2)}
                  </p>
                  <p className="flex items-center">
                    <FaMoneyBillWave className="mr-2 text-blue-500" />
                    <strong>Final Amount:</strong> Tk {selectedInvoice.finalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <h6 className="font-bold flex items-center mb-2">
                  <FaShoppingCart className="mr-2 text-blue-500" />
                  Products:
                </h6>
                <ul className="space-y-2">
                  {selectedInvoice.products.map((product, index) => (
                    <li key={index} className="flex items-center">
                      <FaShoppingCart className="mr-2 text-gray-500" />
                      {product.productId.description} - Quantity: {product.quantity}, Price: Tk{" "}
                      {product.totalPrice?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setShowInvoiceModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


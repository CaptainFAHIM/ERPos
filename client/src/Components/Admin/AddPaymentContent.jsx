"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiDollarSign, FiSearch, FiPlus, FiTrash2, FiBox, FiTag, FiHash, FiAlertCircle } from "react-icons/fi"
import { Button, Modal, TextInput, Select, Toast, Label, Table } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function AddPaymentContent() {
  const [payment, setPayment] = useState({
    supplier: "",
    paymentMethod: "",
    invoiceNumber: "",
    notes: "",
  })

  const [selectedProducts, setSelectedProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [totals, setTotals] = useState({
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        axios.get("http://localhost:4000/api/suppliers"),
        axios.get("http://localhost:4000/api/productlist"),
      ])
      setSuppliers(suppliersRes.data)
      setProducts(productsRes.data)
      generateInvoiceNumber()
    } catch (error) {
      console.error("Error fetching initial data:", error)
      showToast("Failed to load initial data", "error")
    } finally {
      setLoading(false)
    }
  }

  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000
    setPayment((prev) => ({ ...prev, invoiceNumber: randomNum.toString() }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPayment((prev) => ({ ...prev, [name]: value }))

    if (name === "paidAmount") {
      const paidAmount = Number.parseFloat(value) || 0
      const dueAmount = (totals.totalAmount - paidAmount).toFixed(2)
      setTotals((prev) => ({ ...prev, paidAmount, dueAmount }))
    }
  }

  const handleProductSelect = (product) => {
    const newProduct = {
      product: product._id,
      productDetails: product,
      quantity: 1,
      unitPrice: product.purchasePrice || 0,
      sellPrice: product.sellPrice || 0,
      totalPrice: product.purchasePrice || 0,
    }
    setSelectedProducts((prev) => [...prev, newProduct])
    setShowProductModal(false)
    showToast("Product added successfully")
  }

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts]
    updatedProducts[index][field] = value

    if (field === "quantity" || field === "unitPrice") {
      updatedProducts[index].totalPrice = updatedProducts[index].quantity * updatedProducts[index].unitPrice
    }

    setSelectedProducts(updatedProducts)
    calculateTotals(updatedProducts)
  }

  const calculateTotals = (products) => {
    const totalAmount = products.reduce((sum, item) => sum + item.totalPrice, 0)
    const dueAmount = totalAmount - totals.paidAmount
    setTotals((prev) => ({
      ...prev,
      totalAmount,
      dueAmount,
    }))
  }

  const removeProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index)
    setSelectedProducts(updatedProducts)
    calculateTotals(updatedProducts)
    showToast("Product removed", "warning")
  }

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) => value?.toString().toLowerCase().includes(productSearchTerm.toLowerCase())),
  )

  const handleSavePayment = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const paymentData = {
        supplier: payment.supplier,
        products: selectedProducts.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sellPrice: item.sellPrice,
          totalPrice: item.totalPrice,
          description: item.productDetails.description, // Add the description field
        })),
        totalAmount: totals.totalAmount,
        paidAmount: totals.paidAmount,
        paymentMethod: payment.paymentMethod,
        invoiceNumber: payment.invoiceNumber,
        notes: payment.notes,
      }

      await axios.post("http://localhost:4000/api/payments", paymentData)
      showToast("Payment added successfully!")

      // Reset form
      setPayment({
        supplier: "",
        paymentMethod: "",
        invoiceNumber: "",
        notes: "",
      })
      setSelectedProducts([])
      setTotals({
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0,
      })
      generateInvoiceNumber()
    } catch (error) {
      console.error("Error adding payment:", error)
      showToast("Failed to add payment", "error")
    } finally {
      setLoading(false)
    }
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
              <div className="absolute inset-0 bg-purple-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Payment</h1>
              <p className="text-sm text-gray-500">Create a new payment record</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <form onSubmit={handleSavePayment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="supplier" className="text-gray-700">
                  Select Supplier
                </Label>
                <Select
                  id="supplier"
                  name="supplier"
                  value={payment.supplier}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => setShowProductModal(true)}
                  type="button"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0"
                >
                  <FiPlus className="w-5 h-5 mr-2" /> Add Products
                </Button>
              </div>
            </div>

            {/* Products Table */}
            {selectedProducts.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <Table>
                  <Table.Head className="bg-gray-50/50">
                    <Table.HeadCell>Product</Table.HeadCell>
                    <Table.HeadCell>Quantity</Table.HeadCell>
                    <Table.HeadCell>Unit Price (Tk)</Table.HeadCell>
                    <Table.HeadCell>Sell Price (Tk)</Table.HeadCell>
                    <Table.HeadCell>Total (Tk)</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body className="divide-y divide-gray-100">
                    {selectedProducts.map((item, index) => (
                      <Table.Row key={index} className="bg-white">
                        <Table.Cell className="font-medium">
                          <div>
                            <p className="font-semibold">{item.productDetails.description}</p>
                            <p className="text-sm text-gray-500">{item.productDetails.barcode}</p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <TextInput
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}
                            min="1"
                            className="w-20"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <TextInput
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleProductChange(index, "unitPrice", Number(e.target.value))}
                            step="0.01"
                            className="w-24"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <TextInput
                            type="number"
                            value={item.sellPrice}
                            onChange={(e) => handleProductChange(index, "sellPrice", Number(e.target.value))}
                            step="0.01"
                            className="w-24"
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <span className="font-semibold">Tk {item.totalPrice.toFixed(2)}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <Button
                            size="sm"
                            onClick={() => removeProduct(index)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-0"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Total Amount (Tk)</Label>
                <TextInput value={totals.totalAmount.toFixed(2)} readOnly className="bg-gray-50" />
              </div>
              <div className="space-y-2">
                <Label>Paid Amount (Tk)</Label>
                <TextInput
                  name="paidAmount"
                  value={totals.paidAmount}
                  onChange={handleInputChange}
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due Amount (Tk)</Label>
                <TextInput value={totals.dueAmount} readOnly className="bg-gray-50" />
              </div>
            </div>

            {/* Payment Method and Invoice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select name="paymentMethod" value={payment.paymentMethod} onChange={handleInputChange} required>
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <TextInput value={payment.invoiceNumber} readOnly className="bg-gray-50" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <TextInput
                name="notes"
                value={payment.notes}
                onChange={handleInputChange}
                placeholder="Add any additional notes here"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || selectedProducts.length === 0}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>Save Payment</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Product Selection Modal */}
      <Modal show={showProductModal} onClose={() => setShowProductModal(false)} size="xl" className="backdrop-blur-sm">
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Select Products</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <TextInput
                type="search"
                placeholder="Search products..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 border rounded-xl cursor-pointer hover:bg-gray-50/50 transition duration-150"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <FiBox className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900">{product.description}</p>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiHash className="w-4 h-4" />
                            {product.barcode}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiTag className="w-4 h-4" />
                            {product.brand}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                            Purchase: Tk {product.purchasePrice}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium ml-2">
                            Sell: Tk {product.sellPrice}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium ml-2">
                            Stock: {product.totalQuantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Modal.Body>
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


"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button, TextInput, Spinner, Select, Modal, Label, Table } from "flowbite-react"
import { FaSave, FaPlus, FaTrash, FaBox, FaBarcode, FaTag, FaTags, FaSearch } from "react-icons/fa"

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
  const [isLoading, setIsLoading] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [totals, setTotals] = useState({
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
  })

  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
    generateInvoiceNumber()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/suppliers")
      setSuppliers(response.data)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/productlist")
      setProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000
    const invoiceNumber = randomNum.toString()
    setPayment((prev) => ({ ...prev, invoiceNumber }))
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
    setShowProductDetails(false)
  }

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts]
    updatedProducts[index][field] = value

    // Recalculate total price for the product
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
  }

  const filteredProducts = products.filter(
    (product) =>
      product.description?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(productSearchTerm.toLowerCase()),
  )

  const handleSavePayment = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const paymentData = {
        supplier: payment.supplier,
        products: selectedProducts.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          sellPrice: item.sellPrice,
          totalPrice: item.totalPrice,
        })),
        totalAmount: totals.totalAmount,
        paidAmount: totals.paidAmount,
        paymentMethod: payment.paymentMethod,
        invoiceNumber: payment.invoiceNumber,
        notes: payment.notes,
      }

      await axios.post("http://localhost:4000/api/payments", paymentData)
      alert("Payment added successfully!")

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
      alert("Failed to add payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Payment</h1>

      <form onSubmit={handleSavePayment} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supplier" className="mb-2 block">
              Select Supplier
            </Label>
            <Select id="supplier" name="supplier" value={payment.supplier} onChange={handleInputChange} required>
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-end">
            <Button color="light" onClick={() => setShowProductDetails(true)} type="button" className="w-full">
              <FaPlus className="mr-2" /> Add More Products
            </Button>
          </div>
        </div>

        {/* Products Table */}
        {selectedProducts.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Barcode</Table.HeadCell>
                <Table.HeadCell>Brand</Table.HeadCell>
                <Table.HeadCell>Category</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
                <Table.HeadCell>Unit Price (Tk)</Table.HeadCell>
                <Table.HeadCell>Sell Price (Tk)</Table.HeadCell>
                <Table.HeadCell>Total (Tk)</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {selectedProducts.map((item, index) => (
                  <Table.Row key={index}>
                    <Table.Cell>{item.productDetails.description}</Table.Cell>
                    <Table.Cell>{item.productDetails.barcode}</Table.Cell>
                    <Table.Cell>{item.productDetails.brand}</Table.Cell>
                    <Table.Cell>{item.productDetails.category}</Table.Cell>
                    <Table.Cell>
                      <div>
                        <Label htmlFor={`quantity-${index}`} className="sr-only">
                          Quantity
                        </Label>
                        <TextInput
                          id={`quantity-${index}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}
                          min="1"
                          className="w-20"
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <Label htmlFor={`unitPrice-${index}`} className="sr-only">
                          Unit Price
                        </Label>
                        <TextInput
                          id={`unitPrice-${index}`}
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleProductChange(index, "unitPrice", Number(e.target.value))}
                          step="0.01"
                          className="w-24"
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <Label htmlFor={`sellPrice-${index}`} className="sr-only">
                          Sell Price
                        </Label>
                        <TextInput
                          id={`sellPrice-${index}`}
                          type="number"
                          value={item.sellPrice}
                          onChange={(e) => handleProductChange(index, "sellPrice", Number(e.target.value))}
                          step="0.01"
                          className="w-24"
                        />
                      </div>
                    </Table.Cell>
                    <Table.Cell>Tk {item.totalPrice.toFixed(2)}</Table.Cell>
                    <Table.Cell>
                      <Button color="failure" size="sm" onClick={() => removeProduct(index)}>
                        <FaTrash />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="totalAmount" className="mb-2 block">
              Total Amount (Tk)
            </Label>
            <TextInput
              id="totalAmount"
              name="totalAmount"
              value={totals.totalAmount.toFixed(2)}
              placeholder="Total Amount"
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="paidAmount" className="mb-2 block">
              Paid Amount (Tk)
            </Label>
            <TextInput
              id="paidAmount"
              name="paidAmount"
              value={totals.paidAmount}
              onChange={handleInputChange}
              placeholder="Paid Amount"
              type="number"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="dueAmount" className="mb-2 block">
              Due Amount (Tk)
            </Label>
            <TextInput id="dueAmount" name="dueAmount" value={totals.dueAmount} placeholder="Due Amount" readOnly />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentMethod" className="mb-2 block">
              Payment Method
            </Label>
            <Select
              id="paymentMethod"
              name="paymentMethod"
              value={payment.paymentMethod}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Payment Method</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="credit_card">Credit Card</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="invoiceNumber" className="mb-2 block">
              Invoice Number
            </Label>
            <TextInput
              id="invoiceNumber"
              name="invoiceNumber"
              value={payment.invoiceNumber}
              placeholder="Invoice Number"
              readOnly
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="mb-2 block">
            Notes
          </Label>
          <TextInput
            id="notes"
            name="notes"
            value={payment.notes}
            onChange={handleInputChange}
            placeholder="Notes (Optional)"
          />
          <p className="text-sm text-gray-500 mt-1">Notes are optional</p>
        </div>

        <Button type="submit" disabled={isLoading || selectedProducts.length === 0}>
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FaSave className="mr-2" /> Save Payment
            </>
          )}
        </Button>
      </form>

      {/* Product Selection Modal */}
      <Modal show={showProductDetails} onClose={() => setShowProductDetails(false)} size="xl">
        <Modal.Header>Select a Product</Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <Label htmlFor="productSearch">Search Products</Label>
            <TextInput
              id="productSearch"
              type="search"
              icon={FaSearch}
              placeholder="Search by description, barcode, or brand..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
            />
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out"
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex items-center gap-3">
                  <FaBox className="text-gray-500" size={24} />
                  <div className="flex-grow">
                    <p className="font-bold text-lg">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaBarcode className="text-gray-400" size={16} />
                        {product.barcode}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaTag className="text-gray-400" size={16} />
                        {product.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaTags className="text-gray-400" size={16} />
                        {product.brand}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="mr-4">Purchase Price: Tk {product.purchasePrice}</span>
                      <span className="mr-4">Sell Price: Tk {product.sellPrice}</span>
                      <span>Stock: {product.totalQuantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}


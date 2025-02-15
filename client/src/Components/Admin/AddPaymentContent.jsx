"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button, TextInput, Spinner, Select } from "flowbite-react"
import { FaSave } from "react-icons/fa"

export default function AddPaymentContent() {
  const [payment, setPayment] = useState({
    supplier: "",
    product: "",
    quantity: "",
    unitPrice: "",
    totalPrice: "",
    paidAmount: "",
    dueAmount: "",
    paymentMethod: "",
    invoiceNumber: "",
    notes: "",
  })
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSuppliers()
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

  const generateInvoiceNumber = () => {
    const randomNum = Math.floor(Math.random() * 9000000000) + 1000000000
    const invoiceNumber = randomNum.toString()
    setPayment((prev) => ({ ...prev, invoiceNumber }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPayment((prev) => ({ ...prev, [name]: value }))

    if (name === "quantity" || name === "unitPrice") {
      const quantity = Number.parseFloat(e.target.name === "quantity" ? value : payment.quantity) || 0
      const unitPrice = Number.parseFloat(e.target.name === "unitPrice" ? value : payment.unitPrice) || 0
      const totalPrice = (quantity * unitPrice).toFixed(2)
      setPayment((prev) => ({ ...prev, totalPrice }))
    }

    if (name === "paidAmount") {
      const totalPrice = Number.parseFloat(payment.totalPrice) || 0
      const paidAmount = Number.parseFloat(value) || 0
      const dueAmount = (totalPrice - paidAmount).toFixed(2)
      setPayment((prev) => ({ ...prev, dueAmount }))
    }
  }

  const handleSavePayment = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await axios.post("http://localhost:4000/api/payments", payment)
      alert("Payment added successfully!")
      setPayment({
        supplier: "",
        product: "",
        quantity: "",
        unitPrice: "",
        totalPrice: "",
        paidAmount: "",
        dueAmount: "",
        paymentMethod: "",
        invoiceNumber: "",
        notes: "",
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
    <div className="container mx-auto max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-4">Add Payment</h1>
      <form onSubmit={handleSavePayment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select name="supplier" value={payment.supplier} onChange={handleInputChange} required>
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name}
            </option>
          ))}
        </Select>
        <TextInput name="product" value={payment.product} onChange={handleInputChange} placeholder="Product" required />
        <TextInput
          name="quantity"
          value={payment.quantity}
          onChange={handleInputChange}
          placeholder="Quantity"
          type="number"
          required
        />
        <TextInput
          name="unitPrice"
          value={payment.unitPrice}
          onChange={handleInputChange}
          placeholder="Unit Price"
          type="number"
          step="0.01"
          required
        />
        <TextInput
          name="totalPrice"
          value={payment.totalPrice}
          onChange={handleInputChange}
          placeholder="Total Price"
          type="number"
          step="0.01"
          readOnly
        />
        <TextInput
          name="paidAmount"
          value={payment.paidAmount}
          onChange={handleInputChange}
          placeholder="Paid Amount"
          type="number"
          step="0.01"
          required
        />
        <TextInput
          name="dueAmount"
          value={payment.dueAmount}
          onChange={handleInputChange}
          placeholder="Due Amount"
          type="number"
          step="0.01"
          readOnly
        />
        <Select name="paymentMethod" value={payment.paymentMethod} onChange={handleInputChange} required>
          <option value="">Select Payment Method</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="check">Check</option>
          <option value="credit_card">Credit Card</option>
        </Select>
        <TextInput
          name="invoiceNumber"
          value={payment.invoiceNumber}
          onChange={handleInputChange}
          placeholder="Invoice Number"
          readOnly
        />
        <div className="col-span-2">
          <TextInput name="notes" value={payment.notes} onChange={handleInputChange} placeholder="Notes (Optional)" />
          <p className="text-sm text-gray-500 mt-1">Notes are optional</p>
        </div>
        <Button type="submit" disabled={isLoading} className="col-span-2">
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FaSave className="mr-2" /> Save Payment
            </>
          )}
        </Button>
      </form>
    </div>
  )
}


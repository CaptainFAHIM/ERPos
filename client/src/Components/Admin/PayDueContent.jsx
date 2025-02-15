"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button, TextInput, Spinner, Select } from "flowbite-react"
import { FaSave } from "react-icons/fa"

export default function PayDueContent() {
  const [payment, setPayment] = useState({
    supplier: "",
    paidAmount: "",
    paymentMethod: "",
    invoiceNumber: "",
    notes: "",
  })
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)

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

    if (name === "supplier") {
      const selected = suppliers.find((s) => s._id === value) || null
      setSelectedSupplier(selected)
    }
  }

  const handleSavePayment = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const dueAmount = selectedSupplier?.dueAmount ? selectedSupplier.dueAmount - Number(payment.paidAmount) : 0

      const paymentData = {
        ...payment,
        dueAmount: dueAmount >= 0 ? dueAmount : 0,
      }

      await axios.post("http://localhost:4000/api/payments", paymentData)
      alert("Due payment added successfully!")

      setPayment({
        supplier: "",
        paidAmount: "",
        paymentMethod: "",
        invoiceNumber: "",
        notes: "",
      })
      setSelectedSupplier(null)
      generateInvoiceNumber()
    } catch (error) {
      console.error("Error adding due payment:", error)
      alert("Failed to add due payment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-4">Pay Due</h1>
      <form onSubmit={handleSavePayment} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select name="supplier" value={payment.supplier} onChange={handleInputChange} required>
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier._id} value={supplier._id}>
              {supplier.name} (Due: ${supplier.dueAmount?.toFixed(2) ?? "0.00"})
            </option>
          ))}
        </Select>
        <TextInput
          name="paidAmount"
          value={payment.paidAmount}
          onChange={handleInputChange}
          placeholder="Paid Amount"
          type="number"
          step="0.01"
          required
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
          placeholder="Invoice Number"
          readOnly
        />
        <div className="col-span-2">
          <TextInput name="notes" value={payment.notes} onChange={handleInputChange} placeholder="Notes (Optional)" />
          <p className="text-sm text-gray-500 mt-1">Notes are optional</p>
        </div>
        {selectedSupplier && (
          <div className="col-span-2">
            <p className="text-sm font-semibold">
              Current Due: ${selectedSupplier?.dueAmount?.toFixed(2) ?? "0.00"}
            </p>
            <p className="text-sm font-semibold">
              Remaining Due: ${((selectedSupplier?.dueAmount ?? 0) - Number(payment.paidAmount || 0)).toFixed(2)}
            </p>
          </div>
        )}
        <Button type="submit" disabled={isLoading} className="col-span-2">
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <FaSave className="mr-2" /> Save Due Payment
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

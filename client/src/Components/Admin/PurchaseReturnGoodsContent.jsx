"use client"

import { useState, useEffect } from "react"
import { Table, Button, Modal, TextInput, Spinner } from "flowbite-react"
import { FaPlus } from "react-icons/fa"
import axios from "axios"

const API_BASE_URL = "http://localhost:4000/api"

export default function PurchaseReturnContent() {
  const [returnRecords, setReturnRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newReturn, setNewReturn] = useState({
    transactionNo: "",
    productId: "",
    returnQuantity: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReturnRecords()
  }, [])

  const fetchReturnRecords = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/sales/return`)
      setReturnRecords(response.data)
    } catch (error) {
      console.error("Error fetching return records:", error)
      setError("Failed to fetch return records. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewReturn({ ...newReturn, [name]: value })
    setError("")
  }

  const handleAddReturn = async () => {
    if (!newReturn.transactionNo || !newReturn.productId || !newReturn.returnQuantity) {
      setError("All fields are required.")
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post(`${API_BASE_URL}/sales/return`, {
        transactionNo: newReturn.transactionNo,
        productId: newReturn.productId,
        returnQuantity: Number(newReturn.returnQuantity),
      })
      setShowModal(false)
      setNewReturn({ transactionNo: "", productId: "", returnQuantity: "" })
      setError("")
      fetchReturnRecords() // Refresh the list of return records
    } catch (error) {
      console.error("Error processing return:", error.response?.data?.message || error.message)
      setError(error.response?.data?.message || "Failed to process return. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Purchase Return Goods</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="flex justify-end mt-4 mb-4">
        <Button
          color="blue"
          onClick={() => {
            setNewReturn({
              transactionNo: "",
              productId: "",
              returnQuantity: "",
            })
            setShowModal(true)
          }}
        >
          <FaPlus className="mr-2" /> Add Return Record
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>Transaction No</Table.HeadCell>
              <Table.HeadCell>Product</Table.HeadCell>
              <Table.HeadCell>Barcode</Table.HeadCell>
              <Table.HeadCell>Return Quantity</Table.HeadCell>
              <Table.HeadCell>Refunded Amount</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {returnRecords.map((record) => (
                <Table.Row key={record._id}>
                  <Table.Cell>{record.transactionNo}</Table.Cell>
                  <Table.Cell>{record.productId?.description || "N/A"}</Table.Cell>
                  <Table.Cell>{record.productId?.barcode || "N/A"}</Table.Cell>
                  <Table.Cell>{record.returnQuantity}</Table.Cell>
                  <Table.Cell>${record.refundedAmount?.toFixed(2) || "N/A"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Add Return Record</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              name="transactionNo"
              value={newReturn.transactionNo}
              onChange={handleInputChange}
              placeholder="Transaction Number"
              required
            />
            <TextInput
              name="productId"
              value={newReturn.productId}
              onChange={handleInputChange}
              placeholder="Product ID"
              required
            />
            <TextInput
              name="returnQuantity"
              value={newReturn.returnQuantity}
              onChange={handleInputChange}
              placeholder="Return Quantity"
              type="number"
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={handleAddReturn} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : "Save"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Table, Button, Modal, TextInput, Label, Spinner } from "flowbite-react"
import { FaPlus, FaTrash, FaEdit, FaBox, FaBarcode, FaTag, FaTags } from "react-icons/fa"
import { Search } from "lucide-react"
import axios from "axios"

const API_BASE_URL = "http://localhost:4000/api"

export default function PurchaseReturnContent() {
  const [returnRecords, setReturnRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newReturn, setNewReturn] = useState({
    product: "",
    barcode: "",
    category: "",
    brand: "",
    price: "",
    quantity: "",
    returnReason: "",
  })
  const [productList, setProductList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReturnItems()
  }, [])

  const fetchReturnItems = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/return-items`)
      setReturnRecords(response.data)
    } catch (error) {
      console.error("Error fetching return items:", error)
      setError("Failed to fetch return items. Please try again.")
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
    if (!newReturn.quantity || !newReturn.returnReason) {
      setError("Quantity and Return Reason are required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/return-items`, {
        ...newReturn,
        quantity: Number(newReturn.quantity),
      })
      await fetchReturnItems()
      setShowModal(false)
      setNewReturn({ product: "", barcode: "", category: "", brand: "", price: "", quantity: "", returnReason: "" })
      setError("")
    } catch (error) {
      console.error("Error adding return item:", error.response?.data?.error || error.message)
      setError(error.response?.data?.error || "Failed to add return item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (returnId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setIsSubmitting(true)
      try {
        await axios.delete(`${API_BASE_URL}/return-items/${returnId}`)
        await fetchReturnItems()
      } catch (error) {
        console.error("Error deleting return item:", error.response?.data?.error || error.message)
        setError("Failed to delete return item. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleEdit = (record) => {
    setNewReturn(record)
    setIsEditing(true)
    setShowModal(true)
  }

  const handleUpdate = async () => {
    if (!newReturn.quantity || !newReturn.returnReason) {
      setError("Quantity and Return Reason are required fields.")
      return
    }

    setIsSubmitting(true)
    try {
      await axios.put(`${API_BASE_URL}/return-items/${newReturn._id}`, {
        ...newReturn,
        quantity: Number(newReturn.quantity),
      })
      await fetchReturnItems()
      setShowModal(false)
      setIsEditing(false)
      setNewReturn({ product: "", barcode: "", category: "", brand: "", price: "", quantity: "", returnReason: "" })
      setError("")
    } catch (error) {
      console.error("Error updating return item:", error.response?.data?.error || error.message)
      setError(error.response?.data?.error || "Failed to update return item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/productlist`)
      setProductList(response.data)
    } catch (error) {
      console.error("Error fetching products:", error.response?.data?.error || error.message)
      setError("Failed to fetch products. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductSelect = (product) => {
    setNewReturn({
      ...newReturn,
      product: product.description,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      price: product.sellPrice,
    })
    setShowProductModal(false)
  }

  const filteredProducts = productList.filter(
    (product) =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Purchase Return Goods</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-scroll">
          <Table striped>
            <Table.Head>
              <Table.HeadCell className="px-2 py-3">No.</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Barcode</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Product</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Category</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Brand</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Price</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Qty</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Return Reason</Table.HeadCell>
              <Table.HeadCell className="px-2 py-3">Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {returnRecords.map((record, index) => (
                <Table.Row key={record._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="px-2 py-3 whitespace-nowrap">{index + 1}</Table.Cell>
                  <Table.Cell className="px-2 py-3 whitespace-nowrap">{record.barcode}</Table.Cell>
                  <Table.Cell className="px-2 py-3">{record.product}</Table.Cell>
                  <Table.Cell className="px-2 py-3">{record.category}</Table.Cell>
                  <Table.Cell className="px-2 py-3">{record.brand}</Table.Cell>
                  <Table.Cell className="px-2 py-3 whitespace-nowrap">TK {record.price}</Table.Cell>
                  <Table.Cell className="px-2 py-3 whitespace-nowrap">{record.quantity}</Table.Cell>
                  <Table.Cell className="px-2 py-3">{record.returnReason}</Table.Cell>
                  <Table.Cell className="px-2 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Button color="blue" size="xs" onClick={() => handleEdit(record)} aria-label="Edit">
                        <FaEdit />
                      </Button>
                      <Button color="failure" size="xs" onClick={() => handleDelete(record._id)} aria-label="Delete">
                        <FaTrash />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button
          color="blue"
          onClick={() => {
            setIsEditing(false)
            setNewReturn({
              product: "",
              barcode: "",
              category: "",
              brand: "",
              price: "",
              quantity: "",
              returnReason: "",
            })
            setShowModal(true)
          }}
        >
          <FaPlus className="mr-2" /> Add Return Record
        </Button>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>{isEditing ? "Edit Return Record" : "Add Return Record"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setShowProductModal(true)
                fetchProducts()
              }}
            >
              Select Product
            </Button>
            <TextInput name="barcode" value={newReturn.barcode} onChange={handleInputChange} placeholder="Barcode" />
            <TextInput name="product" value={newReturn.product} onChange={handleInputChange} placeholder="Product" />
            <TextInput name="category" value={newReturn.category} onChange={handleInputChange} placeholder="Category" />
            <TextInput name="brand" value={newReturn.brand} onChange={handleInputChange} placeholder="Brand" />
            <TextInput name="price" value={newReturn.price} onChange={handleInputChange} placeholder="Price" />
            <TextInput
              name="quantity"
              value={newReturn.quantity}
              onChange={handleInputChange}
              placeholder="Quantity"
              type="number"
              required
            />
            <TextInput
              name="returnReason"
              value={newReturn.returnReason}
              onChange={handleInputChange}
              placeholder="Reason for Return"
              required
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="blue" onClick={isEditing ? handleUpdate : handleAddReturn} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" /> : isEditing ? "Update" : "Save"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProductModal} onClose={() => setShowProductModal(false)} size="xl">
        <Modal.Header>Select a Product</Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <TextInput
              id="search"
              type="search"
              icon={Search}
              placeholder="Search for products..."
              required={true}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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


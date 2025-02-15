"use client"

import { useState, useEffect } from "react"
import { Table, Button, Modal, TextInput, Label } from "flowbite-react"
import { FaPlus, FaTrash, FaBox, FaBarcode, FaTag, FaTags } from "react-icons/fa"
import { Search } from "lucide-react"

function DamageContent() {
  const [damageRecords, setDamageRecords] = useState([])
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [newDamage, setNewDamage] = useState({
    barcode: "",
    product: "",
    category: "",
    brand: "",
    price: 0,
    quantity: 0,
    reason: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchDamageRecords()
    fetchProducts()
  }, [])

  const fetchDamageRecords = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/damageproduct/")
      if (!response.ok) throw new Error("Failed to fetch damage records")
      const data = await response.json()
      setDamageRecords(data)
    } catch (error) {
      console.error("Error fetching damage records:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/productlist/")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewDamage({ ...newDamage, [name]: value })
  }

  const handleAddDamage = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/damageproduct/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDamage),
      })
      if (!response.ok) throw new Error("Failed to add damage record")
      await fetchDamageRecords()
      setShowModal(false)
      setNewDamage({
        barcode: "",
        product: "",
        category: "",
        brand: "",
        price: 0,
        quantity: 0,
        reason: "",
        date: new Date().toISOString().split("T")[0],
      })
      setSelectedProduct(null)
    } catch (error) {
      console.error("Error adding damage record:", error)
    }
  }

  const handleDelete = async (damageId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        const response = await fetch(`http://localhost:4000/api/damageproduct/${damageId}`, {
          method: "DELETE",
        })
        if (!response.ok) throw new Error("Failed to delete damage record")
        await fetchDamageRecords()
      } catch (error) {
        console.error("Error deleting damage record:", error)
      }
    }
  }

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setNewDamage({
      ...newDamage,
      barcode: product.barcode,
      product: product.description,
      category: product.category,
      brand: product.brand,
      price: product.sellPrice,
    })
    setShowProductDetails(false)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.description.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(productSearchTerm.toLowerCase()),
  )

  const filteredDamageRecords = damageRecords.filter(
    (record) =>
      record.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.price.toString().includes(searchTerm),
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Damaged Products</h1>
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add Damage Record
        </Button>
      </div>

      <div className="mb-4">
        <TextInput
          type="search"
          icon={Search}
          placeholder="Search by Barcode, Product, Category, Brand, or Price"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>No.</Table.HeadCell>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Barcode</Table.HeadCell>
            <Table.HeadCell>Product</Table.HeadCell>
            <Table.HeadCell>Category</Table.HeadCell>
            <Table.HeadCell>Brand</Table.HeadCell>
            <Table.HeadCell>Price</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Reason</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredDamageRecords.map((record, index) => (
              <Table.Row key={record._id}>
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>{new Date(record.date).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{record.barcode}</Table.Cell>
                <Table.Cell>{record.product}</Table.Cell>
                <Table.Cell>{record.category}</Table.Cell>
                <Table.Cell>{record.brand}</Table.Cell>
                <Table.Cell>${record.price}</Table.Cell>
                <Table.Cell>{record.quantity}</Table.Cell>
                <Table.Cell>{record.reason}</Table.Cell>
                <Table.Cell>
                  <Button color="failure" size="sm" onClick={() => record._id && handleDelete(record._id)}>
                    <FaTrash />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
        <Modal.Header>Add Damage Record</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Button onClick={() => setShowProductDetails(true)}>Select Product</Button>
            <TextInput
              name="barcode"
              value={newDamage.barcode}
              onChange={handleInputChange}
              placeholder="Barcode"
              readOnly
            />
            <TextInput
              name="product"
              value={newDamage.product}
              onChange={handleInputChange}
              placeholder="Product"
              readOnly
            />
            <TextInput
              name="category"
              value={newDamage.category}
              onChange={handleInputChange}
              placeholder="Category"
              readOnly
            />
            <TextInput name="brand" value={newDamage.brand} onChange={handleInputChange} placeholder="Brand" readOnly />
            <TextInput name="price" value={newDamage.price} onChange={handleInputChange} placeholder="Price" readOnly />
            <TextInput
              name="quantity"
              value={newDamage.quantity}
              onChange={handleInputChange}
              placeholder="Quantity"
              type="number"
            />
            <TextInput
              name="reason"
              value={newDamage.reason}
              onChange={handleInputChange}
              placeholder="Reason for Damage"
            />
            <TextInput name="date" value={newDamage.date} onChange={handleInputChange} placeholder="Date" type="date" />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddDamage}>Save</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProductDetails} onClose={() => setShowProductDetails(false)} size="xl">
        <Modal.Header>Select a Product</Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <Label htmlFor="productSearch" className="sr-only">
              Search Products
            </Label>
            <TextInput
              id="productSearch"
              type="search"
              icon={Search}
              placeholder="Search for products..."
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

export default DamageContent


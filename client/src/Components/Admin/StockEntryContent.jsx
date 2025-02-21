"use client"

import { useState, useEffect } from "react"
import { Button, TextInput, Select, Table, Modal, Label } from "flowbite-react"
import axios from "axios"
import { Search } from "lucide-react"
import { FaBarcode, FaBox, FaTag, FaTags } from "react-icons/fa"

export default function StockEntryContent() {
  const [stockEntry, setStockEntry] = useState({
    referenceNo: "",
    stockInBy: "fahim1234",
    stockInDate: new Date().toISOString().split("T")[0],
    supplier: "",
    contactPerson: "",
    address: "",
  })

  const [suppliers, setSuppliers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [productList, setProductList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch suppliers list from the API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/suppliers/")
        const data = await response.json()
        setSuppliers(data)
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      }
    }

    fetchSuppliers()
  }, [])

  // Fetch supplier details based on selected supplier
  useEffect(() => {
    const fetchSupplierDetails = async () => {
      if (stockEntry.supplier) {
        try {
          const response = await fetch(`http://localhost:4000/api/suppliers/${stockEntry.supplier}`)
          const data = await response.json()

          if (data) {
            setStockEntry((prevState) => ({
              ...prevState,
              contactPerson: data.contactPerson,
              address: data.address,
            }))
          }
        } catch (error) {
          console.error("Error fetching supplier details:", error)
        }
      }
    }

    fetchSupplierDetails()
  }, [stockEntry.supplier])

  // Generate Reference Number
  const generateReference = () => {
    const timestamp = Date.now()
    setStockEntry((prevState) => ({ ...prevState, referenceNo: timestamp.toString() }))
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setStockEntry((prevState) => ({ ...prevState, [name]: value }))
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/productlist/")
      setProductList(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // Add product to the products array
  const addProduct = () => {
    setShowModal(true)
    fetchProducts()
  }

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setShowModal(false)
  }

  // Submit stock entry to API and update product quantity
  const handleSubmit = async () => {
    try {
      const stockInData = {
        ...stockEntry,
        productName: selectedProduct ? selectedProduct.description : "",
        barcode: selectedProduct ? selectedProduct.barcode : "",
        quantity: quantity,
      }

      const response = await axios.post("http://localhost:4000/api/stockin/", stockInData)

      if (response.status === 201) {
        // Update product quantity in the product list
        if (selectedProduct) {
          const productResponse = await axios.get(`http://localhost:4000/api/productlist/${selectedProduct._id}`)
          const currentProduct = productResponse.data
          const updatedQuantity = currentProduct.totalQuantity + Number.parseInt(quantity)

          await axios.put(`http://localhost:4000/api/productlist/${selectedProduct._id}`, {
            ...currentProduct,
            totalQuantity: updatedQuantity,
          })
        }

        alert("Stock In entry added successfully and product quantity updated")
        // Clear the form or handle success
        setStockEntry({
          referenceNo: "",
          stockInBy: "fahim1234",
          stockInDate: new Date().toISOString().split("T")[0],
          supplier: "",
          contactPerson: "",
          address: "",
        })
        setSelectedProduct(null)
        setQuantity(1)
      } else {
        alert("Error: " + response.data.message)
      }
    } catch (error) {
      console.error("Error submitting stock entry or updating product quantity:", error)
      alert("Error submitting stock entry or updating product quantity")
    }
  }

  const filteredProducts = productList.filter(
    (product) =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Stock Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="referenceNo" className="text-sm font-medium text-gray-700">
                Reference No:
              </Label>
              <div className="flex gap-2">
                <TextInput
                  id="referenceNo"
                  name="referenceNo"
                  value={stockEntry.referenceNo}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button onClick={generateReference} size="sm">
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stockInBy" className="text-sm font-medium text-gray-700">
                Stock In By:
              </Label>
              <TextInput
                id="stockInBy"
                name="stockInBy"
                value={stockEntry.stockInBy}
                onChange={handleInputChange}
                className="flex-1"
                disabled
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stockInDate" className="text-sm font-medium text-gray-700">
                Stock In Date:
              </Label>
              <TextInput
                id="stockInDate"
                type="date"
                name="stockInDate"
                value={stockEntry.stockInDate}
                onChange={handleInputChange}
                className="flex-1"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier" className="text-sm font-medium text-gray-700">
                Supplier:
              </Label>
              <Select
                id="supplier"
                name="supplier"
                value={stockEntry.supplier}
                onChange={handleInputChange}
                className="flex-1"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">
                Contact Person:
              </Label>
              <TextInput
                id="contactPerson"
                name="contactPerson"
                value={stockEntry.contactPerson}
                onChange={handleInputChange}
                className="flex-1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Address:
              </Label>
              <TextInput
                id="address"
                name="address"
                value={stockEntry.address}
                onChange={handleInputChange}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <Button onClick={addProduct} className="w-full md:w-auto">
            Click here to browse product
          </Button>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Quantity:
            </Label>
            <TextInput
              id="quantity"
              type="number"
              value={quantity.toString()} // Convert to string to fix NaN error
              onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
              className="flex-1"
              min="1"
            />
          </div>
        </div>

        {selectedProduct && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-bold text-lg mb-2">Selected Product:</h3>
            <p>
              <span className="font-medium">Name:</span> {selectedProduct.description}
            </p>
            <p>
              <span className="font-medium">Barcode:</span> {selectedProduct.barcode}
            </p>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
          <Table striped>
            <Table.Head className="bg-gray-100 text-gray-700">
              <Table.HeadCell className="!p-4">No</Table.HeadCell>
              <Table.HeadCell className="!p-4">Reference#</Table.HeadCell>
              <Table.HeadCell className="!p-4">Pcode</Table.HeadCell>
              <Table.HeadCell className="!p-4">Description</Table.HeadCell>
              <Table.HeadCell className="!p-4">Qty</Table.HeadCell>
              <Table.HeadCell className="!p-4">Stock In Date</Table.HeadCell>
              <Table.HeadCell className="!p-4">Stock In By</Table.HeadCell>
              <Table.HeadCell className="!p-4">Supplier</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {selectedProduct && (
                <Table.Row className="bg-white">
                  <Table.Cell className="!p-4">1</Table.Cell>
                  <Table.Cell className="!p-4">{stockEntry.referenceNo}</Table.Cell>
                  <Table.Cell className="!p-4">{selectedProduct.barcode}</Table.Cell>
                  <Table.Cell className="!p-4">{selectedProduct.description}</Table.Cell>
                  <Table.Cell className="!p-4">{quantity}</Table.Cell>
                  <Table.Cell className="!p-4">{stockEntry.stockInDate}</Table.Cell>
                  <Table.Cell className="!p-4">{stockEntry.stockInBy}</Table.Cell>
                  <Table.Cell className="!p-4">{stockEntry.supplier}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} color="success">
            Submit Entry
          </Button>
        </div>

        <Modal show={showModal} onClose={() => setShowModal(false)} size="xl">
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
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Table, Button, Modal, TextInput, Select, Spinner, Alert } from "flowbite-react"
import { FaPlus, FaEdit, FaTrash, FaBarcode, FaDownload, FaSearch } from "react-icons/fa"
import JsBarcode from "jsbarcode"
import FileSaver from "file-saver"

export default function ProductListContent() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    barcode: "",
    description: "",
    category: "",
    brand: "",
    purchasePrice: "",
    sellPrice: "",
    totalQuantity: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [barcodeGenerated, setBarcodeGenerated] = useState(false)
  const [barcodeImageUrl, setBarcodeImageUrl] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm),
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/productlist")
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError("Failed to fetch products. Please try again.")
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/categories/")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to fetch categories. Please try again.")
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/brands/")
      setBrands(response.data)
    } catch (error) {
      console.error("Error fetching brands:", error)
      setError("Failed to fetch brands. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewProduct({ ...newProduct, [name]: value })
    if (name === "barcode") {
      setBarcodeGenerated(false)
      setBarcodeImageUrl("")
    }
    setError("") // Clear any previous errors when input changes
  }

  const validateProduct = () => {
    for (const [key, value] of Object.entries(newProduct)) {
      if (!value) {
        setError(`Please fill in the ${key} field.`)
        return false
      }
    }
    return true
  }

  const checkBarcodeExists = (barcode) => {
    return products.some((product) => product.barcode === barcode && product._id !== editingProduct?._id)
  }

  const handleSaveProduct = async () => {
    setIsLoading(true)
    setError("")

    if (!validateProduct()) {
      setIsLoading(false)
      return
    }

    if (checkBarcodeExists(newProduct.barcode)) {
      setError("A product with this barcode already exists.")
      setIsLoading(false)
      return
    }

    try {
      if (editingProduct) {
        await axios.put(`http://localhost:4000/api/productlist/${editingProduct._id}`, newProduct)
      } else {
        await axios.post("http://localhost:4000/api/productlist", newProduct)
      }
      fetchProducts()
      setShowModal(false)
      setEditingProduct(null)
      setNewProduct({
        barcode: "",
        description: "",
        category: "",
        brand: "",
        purchasePrice: "",
        sellPrice: "",
        totalQuantity: "",
      })
      setBarcodeGenerated(false)
      setBarcodeImageUrl("")
    } catch (error) {
      console.error("Error saving product:", error)
      setError("Failed to save product. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setNewProduct(product)
    setShowModal(true)
    setBarcodeGenerated(false)
    setBarcodeImageUrl("")
    setError("")
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:4000/api/productlist/${productId}`)
        fetchProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
        setError("Failed to delete product. Please try again.")
      }
    }
  }

  const generateBarcode = () => {
    const barcodeValue = Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, "0")
    setNewProduct({ ...newProduct, barcode: barcodeValue })

    const canvas = document.createElement("canvas")
    JsBarcode(canvas, barcodeValue, { format: "EAN13" })
    setBarcodeImageUrl(canvas.toDataURL("image/png"))
    setBarcodeGenerated(true)
  }

  const downloadBarcode = () => {
    if (barcodeGenerated) {
      FileSaver.saveAs(barcodeImageUrl, `barcode-${newProduct.barcode}.png`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Product List</h1>
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add Product
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="overflow-x-auto">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>No.</Table.HeadCell>
            <Table.HeadCell>Barcode</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Category</Table.HeadCell>
            <Table.HeadCell>Brand</Table.HeadCell>
            <Table.HeadCell>Purchase Price</Table.HeadCell>
            <Table.HeadCell>Sell Price</Table.HeadCell>
            <Table.HeadCell>Total Quantity</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {filteredProducts.map((product, index) => (
              <Table.Row key={product._id}>
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>{product.barcode}</Table.Cell>
                <Table.Cell>{product.description}</Table.Cell>
                <Table.Cell>{product.category}</Table.Cell>
                <Table.Cell>{product.brand}</Table.Cell>
                <Table.Cell>{product.purchasePrice}</Table.Cell>
                <Table.Cell>{product.sellPrice}</Table.Cell>
                <Table.Cell>{product.totalQuantity}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-1">
                    <Button
                      color="info"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="rounded-l-lg rounded-r-none"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      color="failure"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                      className="rounded-l-none rounded-r-lg"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg">
        <Modal.Header>{editingProduct ? "Edit Product" : "Add New Product"}</Modal.Header>
        <Modal.Body>
          {error && (
            <Alert color="failure" className="mb-4">
              {error}
            </Alert>
          )}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TextInput
                name="barcode"
                value={newProduct.barcode}
                onChange={handleInputChange}
                placeholder="Barcode"
                className="flex-grow"
              />
              <Button onClick={generateBarcode}>
                <FaBarcode className="mr-2" /> Generate
              </Button>
            </div>
            {barcodeGenerated && (
              <div className="flex flex-col items-center space-y-2">
                <img src={barcodeImageUrl || "/placeholder.svg"} alt="Generated Barcode" />
                <Button onClick={downloadBarcode}>
                  <FaDownload className="mr-2" /> Download
                </Button>
              </div>
            )}
            <TextInput
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder="Description"
            />
            <Select name="category" value={newProduct.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </Select>
            <Select name="brand" value={newProduct.brand} onChange={handleInputChange}>
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand.brandName}>
                  {brand.brandName}
                </option>
              ))}
            </Select>
            <TextInput
              name="purchasePrice"
              value={newProduct.purchasePrice}
              onChange={handleInputChange}
              placeholder="Purchase Price"
              type="number"
            />
            <TextInput
              name="sellPrice"
              value={newProduct.sellPrice}
              onChange={handleInputChange}
              placeholder="Sell Price"
              type="number"
            />
            <TextInput
              name="totalQuantity"
              value={newProduct.totalQuantity}
              onChange={handleInputChange}
              placeholder="Total Quantity"
              type="number"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSaveProduct} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Save"}
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiPlus, FiEdit3, FiTrash2, FiAlertCircle, FiSearch, FiBarChart, FiDownload, FiBox } from "react-icons/fi"
import { Button, Modal, TextInput, Select, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"
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

  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

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
      if (!value && key !== "__v") {
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
        const updatedProduct = { ...newProduct, __v: editingProduct.__v }
        await axios.put(`http://localhost:4000/api/productlist/${editingProduct._id}`, updatedProduct)
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
    setNewProduct({
      ...product,
      purchasePrice: product.purchasePrice.toString(),
      sellPrice: product.sellPrice.toString(),
      totalQuantity: product.totalQuantity.toString(),
    })
    setShowModal(true)
    setBarcodeGenerated(false)
    setBarcodeImageUrl("")
    setError("")
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/productlist/${deletingId}`)
      showToast("Product deleted successfully")
      fetchProducts()
      setShowDeleteModal(false)
      setDeletingId(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      showToast("Failed to delete product", "error")
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
              <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiBox className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500">Manage your product inventory</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full lg:w-1/3"
          />
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Barcode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Brand</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Purchase Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Sell Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {isLoading
                  ? [...Array(3)].map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-20 bg-gray-200 rounded float-right"></div>
                        </td>
                      </tr>
                    ))
                  : filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{product.barcode}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{product.description}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.brand}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">${product.purchasePrice}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">${product.sellPrice}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            product.totalQuantity <= 10
                              ? "bg-red-100 text-red-800"
                              : product.totalQuantity <= 30
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                          >
                            {product.totalQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 transition-all duration-300"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setDeletingId(product._id)
                                setShowDeleteModal(true)
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-0 transition-all duration-300"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => {
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
        }}
        size="lg"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TextInput
                name="barcode"
                value={newProduct.barcode}
                onChange={handleInputChange}
                placeholder="Barcode"
                className="flex-grow"
              />
              <Button
                onClick={generateBarcode}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
              >
                <FiBarChart className="w-4 h-4 mr-2" /> Generate
              </Button>
            </div>

            {barcodeGenerated && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg"
              >
                <img
                  src={barcodeImageUrl || "/placeholder.svg"}
                  alt="Generated Barcode"
                  className="max-w-full h-auto"
                />
                <Button onClick={downloadBarcode} className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0">
                  <FiDownload className="w-4 h-4 mr-2" /> Download
                </Button>
              </motion.div>
            )}

            <TextInput
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
              placeholder="Description"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select name="category" value={newProduct.category} onChange={handleInputChange} className="w-full">
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </Select>

              <Select name="brand" value={newProduct.brand} onChange={handleInputChange} className="w-full">
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand.brandName}>
                    {brand.brandName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={() => {
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
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeletingId(null)
        }}
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Confirm Delete</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="flex items-center gap-3 text-gray-600">
            <FiAlertCircle className="w-5 h-5 text-red-500" />
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={() => {
                setShowDeleteModal(false)
                setDeletingId(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white border-0">
              Delete
            </Button>
          </div>
        </Modal.Footer>
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


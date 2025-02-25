"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package2,
  Plus,
  Trash2,
  Search,
  Box,
  Tag,
  Barcode,
  Calendar,
  DollarSign,
  AlertCircle,
  PackageCheck,
  ShoppingBag,
  Store,
  ClipboardList,
  AlertTriangle,
} from "lucide-react"
import { Button, Modal, TextInput, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function DamageContent() {
  const [damageRecords, setDamageRecords] = useState([])
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
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

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  useEffect(() => {
    fetchDamageRecords()
    fetchProducts()
  }, [])

  const fetchDamageRecords = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:4000/api/damageproduct/")
      if (!response.ok) throw new Error("Failed to fetch damage records")
      const data = await response.json()
      setDamageRecords(data)
    } catch (error) {
      console.error("Error fetching damage records:", error)
      showToast("Failed to fetch damage records", "error")
    } finally {
      setLoading(false)
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
      showToast("Failed to fetch products", "error")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewDamage({ ...newDamage, [name]: value })
  }

  const handleAddDamage = async () => {
    if (!newDamage.product || !newDamage.quantity || !newDamage.reason) {
      showToast("Please fill in all required fields", "warning")
      return
    }

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
      showToast("Damage record added successfully")
    } catch (error) {
      console.error("Error adding damage record:", error)
      showToast("Failed to add damage record", "error")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/damageproduct/${deletingId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete damage record")

      await fetchDamageRecords()
      setShowDeleteModal(false)
      setDeletingId(null)
      showToast("Damage record deleted successfully")
    } catch (error) {
      console.error("Error deleting damage record:", error)
      showToast("Failed to delete damage record", "error")
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
              <div className="absolute inset-0 bg-rose-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Package2 className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Damaged Products</h1>
              <p className="text-sm text-gray-500">Manage damaged product records</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Damage Record
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <TextInput
            type="search"
            placeholder="Search damage records..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Barcode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Brand</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Reason</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
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
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-20 bg-gray-200 rounded float-right"></div>
                        </td>
                      </tr>
                    ))
                  : filteredDamageRecords.map((record, index) => (
                      <motion.tr
                        key={record._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{record.barcode}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{record.product}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.brand}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Tk {record.price}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {record.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{record.reason}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => {
                                setDeletingId(record._id)
                                setShowDeleteModal(true)
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border-0 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Add Damage Modal */}
      <Modal
        show={showModal}
        onClose={() => {
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
        }}
        size="lg"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Add Damage Record</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Button
              onClick={() => setShowProductDetails(true)}
              className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 border-0"
            >
              <ShoppingBag className="w-4 h-4 mr-2" /> Select Product
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Barcode</label>
                <TextInput
                  name="barcode"
                  value={newDamage.barcode}
                  onChange={handleInputChange}
                  placeholder="Barcode"
                  icon={Barcode}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Product</label>
                <TextInput
                  name="product"
                  value={newDamage.product}
                  onChange={handleInputChange}
                  placeholder="Product"
                  icon={Box}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <TextInput
                  name="category"
                  value={newDamage.category}
                  onChange={handleInputChange}
                  placeholder="Category"
                  icon={Tag}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Brand</label>
                <TextInput
                  name="brand"
                  value={newDamage.brand}
                  onChange={handleInputChange}
                  placeholder="Brand"
                  icon={Store}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price</label>
                <TextInput
                  name="price"
                  value={newDamage.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  icon={DollarSign}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <TextInput
                  name="quantity"
                  value={newDamage.quantity}
                  onChange={handleInputChange}
                  placeholder="Quantity"
                  type="number"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <TextInput
                  name="date"
                  value={newDamage.date}
                  onChange={handleInputChange}
                  placeholder="Date"
                  type="date"
                  icon={Calendar}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Reason</label>
              <TextInput
                name="reason"
                value={newDamage.reason}
                onChange={handleInputChange}
                placeholder="Reason for Damage"
                icon={ClipboardList}
                required
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
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDamage}
              className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white border-0"
            >
              Save
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        show={showProductDetails}
        onClose={() => setShowProductDetails(false)}
        size="lg"
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Select a Product</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <TextInput
                type="search"
                placeholder="Search products..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-all duration-200"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <PackageCheck className="text-gray-500 w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-900">{product.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Barcode className="w-4 h-4" />
                            {product.barcode}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {product.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Store className="w-4 h-4" />
                            {product.brand}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Tk {product.sellPrice}</p>
                        <p className="text-xs text-gray-500">In Stock: {product.totalQuantity}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </Modal.Body>
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
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p>Are you sure you want to delete this damage record? This action cannot be undone.</p>
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
                <AlertCircle className="w-5 h-5" />
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


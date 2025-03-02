"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  FaBox,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUser,
  FaBarcode,
  FaHashtag,
  FaExclamationCircle,
  FaBoxOpen,
} from "react-icons/fa"
import { Button, Modal, TextInput, Toast, Label, Table } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function StockAdjustmentsContent() {
  const [adjustment, setAdjustment] = useState({
    referenceNo: "",
    supplier: "",
    stockInBy: "",
    stockInDate: "",
    contactPerson: "",
    address: "",
    productName: "",
    barcode: "",
    quantity: 0,
  })

  const [stockInEntries, setStockInEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    fetchStockInEntries()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchStockInEntries = async () => {
    setLoading(true)
    try {
      const response = await axios.get("http://localhost:4000/api/stockin")
      setStockInEntries(response.data)
    } catch (error) {
      console.error("Error fetching stock-in entries:", error)
      showToast("Error fetching stock-in entries", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setAdjustment((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
    setAdjustment({
      ...entry,
      stockInDate: entry.stockInDate ? entry.stockInDate.split("T")[0] : "",
    })
    setShowEditModal(true)
  }

  const handleUpdateEntry = async () => {
    setLoading(true)
    try {
      await axios.put(`http://localhost:4000/api/stockin/${selectedEntry._id}`, adjustment)
      fetchStockInEntries()
      setShowEditModal(false)
      setSelectedEntry(null)
      setAdjustment({
        referenceNo: "",
        supplier: "",
        stockInBy: "",
        stockInDate: "",
        contactPerson: "",
        address: "",
        productName: "",
        barcode: "",
        quantity: 0,
      })
      showToast("Stock-in entry updated successfully", "success")
    } catch (error) {
      console.error("Error updating stock-in entry:", error)
      showToast("Error updating stock-in entry", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePrompt = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleDeleteEntry = async () => {
    setLoading(true)
    try {
      await axios.delete(`http://localhost:4000/api/stockin/${deleteId}`)
      fetchStockInEntries()
      setShowDeleteModal(false)
      setDeleteId(null)
      showToast("Stock-in entry deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting stock-in entry:", error)
      showToast("Error deleting stock-in entry", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = stockInEntries.filter(
    (entry) =>
      (entry.referenceNo && entry.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.productName && entry.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.barcode && entry.barcode.toLowerCase().includes(searchTerm.toLowerCase())),
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
              <div className="absolute inset-0 bg-amber-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FaBoxOpen className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
              <p className="text-sm text-gray-500">Manage and modify inventory entries</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6">
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <TextInput
                type="search"
                placeholder="Search by reference number, product name, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Stock Entries Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <Table.Head className="bg-gray-50/50">
                  <Table.HeadCell>Reference No</Table.HeadCell>
                  <Table.HeadCell>Product Name</Table.HeadCell>
                  <Table.HeadCell>Barcode</Table.HeadCell>
                  <Table.HeadCell>Quantity</Table.HeadCell>
                  <Table.HeadCell>Stock In Date</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y divide-gray-100">
                  {loading ? (
                    <Table.Row>
                      <Table.Cell colSpan={6}>
                        <div className="flex justify-center items-center py-8">
                          <div className="w-8 h-8 border-t-2 border-b-2 border-amber-500 rounded-full animate-spin"></div>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : filteredEntries.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={6}>
                        <div className="text-center py-8 text-gray-500">
                          No stock entries found matching your search
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    <AnimatePresence>
                      {filteredEntries.map((entry) => (
                        <motion.tr
                          key={entry._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-white"
                        >
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <FaHashtag className="text-amber-500" />
                              <span className="font-medium">{entry.referenceNo}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <FaBox className="text-amber-500" />
                              <span>{entry.productName}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <FaBarcode className="text-amber-500" />
                              <span>{entry.barcode}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                              {entry.quantity}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-amber-500" />
                              <span>{new Date(entry.stockInDate).toLocaleDateString()}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSelectEntry(entry)}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-600 border-0"
                              >
                                <FaEdit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeletePrompt(entry._id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 border-0"
                              >
                                <FaTrash className="w-4 h-4" />
                              </Button>
                            </div>
                          </Table.Cell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)} size="xl" className="backdrop-blur-sm">
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Update Stock Entry</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <FaUser className="text-amber-500" />
                Supplier Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-gray-700">
                  Supplier
                </Label>
                <TextInput id="supplier" name="supplier" value={adjustment.supplier} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-gray-700">
                  Contact Person
                </Label>
                <TextInput
                  id="contactPerson"
                  name="contactPerson"
                  value={adjustment.contactPerson}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-700">
                  Address
                </Label>
                <TextInput id="address" name="address" value={adjustment.address} onChange={handleInputChange} />
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <FaBox className="text-amber-500" />
                Product Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="productName" className="text-gray-700">
                  Product Name
                </Label>
                <TextInput
                  id="productName"
                  name="productName"
                  value={adjustment.productName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-gray-700">
                  Barcode
                </Label>
                <TextInput id="barcode" name="barcode" value={adjustment.barcode} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-gray-700">
                  Quantity
                </Label>
                <TextInput
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={adjustment.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Other Details */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <FaHashtag className="text-amber-500" />
                Other Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referenceNo" className="text-gray-700">
                    Reference No
                  </Label>
                  <TextInput
                    id="referenceNo"
                    name="referenceNo"
                    value={adjustment.referenceNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockInBy" className="text-gray-700">
                    Stock In By
                  </Label>
                  <TextInput
                    id="stockInBy"
                    name="stockInBy"
                    value={adjustment.stockInBy}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockInDate" className="text-gray-700">
                    Stock In Date
                  </Label>
                  <TextInput
                    id="stockInDate"
                    name="stockInDate"
                    type="date"
                    value={adjustment.stockInDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={handleUpdateEntry}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <>Save Changes</>
            )}
          </Button>
          <Button color="gray" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        size="md"
        popup
        onClose={() => setShowDeleteModal(false)}
        className="backdrop-blur-sm"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 text-gray-400 flex items-center justify-center">
              <FaTrash className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this stock entry?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={handleDeleteEntry}
                disabled={loading}
                className="bg-gradient-to-r from-red-500 to-red-600"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>Yes, delete it</>
                )}
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
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
                <FaExclamationCircle className="w-5 h-5" />
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


"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiPlus, FiEdit3, FiTrash2, FiTruck, FiAlertCircle, FiSearch } from "react-icons/fi"
import { Button, Modal, TextInput, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function SupplierContent() {
  const [suppliers, setSuppliers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  })
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/suppliers")
      setSuppliers(response.data)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      showToast("Failed to fetch suppliers", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!newSupplier.name.trim()) {
      showToast("Please enter a supplier name", "warning")
      return
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:4000/api/suppliers/${editingId}`, newSupplier)
        showToast("Supplier updated successfully")
      } else {
        await axios.post("http://localhost:4000/api/suppliers", newSupplier)
        showToast("Supplier added successfully")
      }
      fetchSuppliers()
      setShowModal(false)
      setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", address: "" })
      setEditingId(null)
    } catch (error) {
      console.error("Error saving supplier:", error)
      showToast("Failed to save supplier", "error")
    }
  }

  const handleEdit = (supplier) => {
    setNewSupplier(supplier)
    setEditingId(supplier._id)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/suppliers/${deletingId}`)
      showToast("Supplier deleted successfully")
      fetchSuppliers()
      setShowDeleteModal(false)
      setDeletingId(null)
    } catch (error) {
      console.error("Error deleting supplier:", error)
      showToast("Failed to delete supplier", "error")
    }
  }

  const filteredSuppliers = suppliers.filter((supplier) =>
    Object.values(supplier).some((value) => value?.toString().toLowerCase().includes(searchTerm.toLowerCase())),
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
              <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <FiTruck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
              <p className="text-sm text-gray-500">Manage your suppliers</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add Supplier
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput
            type="search"
            placeholder="Search suppliers..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact Person</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Address</th>
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
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-40 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-20 bg-gray-200 rounded float-right"></div>
                        </td>
                      </tr>
                    ))
                  : filteredSuppliers.map((supplier, index) => (
                      <motion.tr
                        key={supplier._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{supplier.name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.contactPerson}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{supplier.address}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(supplier)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 transition-all duration-300"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setDeletingId(supplier._id)
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
          setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", address: "" })
          setEditingId(null)
        }}
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">{editingId ? "Edit Supplier" : "Add New Supplier"}</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              value={newSupplier.name}
              onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              placeholder="Supplier name"
              className="w-full"
            />
            <TextInput
              value={newSupplier.contactPerson}
              onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
              placeholder="Contact person"
              className="w-full"
            />
            <TextInput
              value={newSupplier.phone}
              onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              placeholder="Phone number"
              className="w-full"
            />
            <TextInput
              value={newSupplier.email}
              onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
              placeholder="Email address"
              type="email"
              className="w-full"
            />
            <TextInput
              value={newSupplier.address}
              onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              placeholder="Address"
              className="w-full"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={() => {
                setShowModal(false)
                setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", address: "" })
                setEditingId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
            >
              {editingId ? "Update" : "Save"}
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
            <p>Are you sure you want to delete this supplier? This action cannot be undone.</p>
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


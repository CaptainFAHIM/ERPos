"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Button, Modal, Spinner, TextInput, Toast } from "flowbite-react"
import { FiGrid, FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle, FiFolder } from "react-icons/fi"
import { HiX } from "react-icons/hi"

export default function AllCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const toastTimeout = useRef(null)

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type })

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current)
    }

    toastTimeout.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:4000/api/expenseCategories/")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching categories:", error)
      showToast("Failed to fetch categories", "error")
      setError("Failed to fetch categories. Please try again.")
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:4000/api/expenseCategories/${editingCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: editingCategory.categoryName }),
      })
      if (!response.ok) {
        throw new Error("Failed to update category")
      }
      const updatedCategory = await response.json()
      setCategories(
        categories.map((cat) => (cat._id === updatedCategory.category._id ? updatedCategory.category : cat)),
      )
      showToast("Category updated successfully")
      setShowEditModal(false)
    } catch (error) {
      console.error("Error updating category:", error)
      showToast("Failed to update category", "error")
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/expenseCategories/${deletingId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete category")
      }
      setCategories(categories.filter((category) => category._id !== deletingId))
      showToast("Category deleted successfully")
      setShowDeleteModal(false)
      setDeletingId(null)
    } catch (error) {
      console.error("Error deleting category:", error)
      showToast("Failed to delete category", "error")
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/expenseCategories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: newCategoryName }),
      })
      if (!response.ok) {
        throw new Error("Failed to add category")
      }
      const newCategory = await response.json()
      setCategories([...categories, newCategory.expenseCategory])
      setNewCategoryName("")
      showToast("Category added successfully")
    } catch (error) {
      console.error("Error adding category:", error)
      showToast("Failed to add category", "error")
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 space-y-6">
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
                  <FiGrid className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Expense Categories</h1>
                <p className="text-sm text-gray-500">Manage your expense categories</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Category Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
            <TextInput
              type="text"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              className="flex-grow"
              icon={FiFolder}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </form>
        </motion.div>

        {/* Search and Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="relative">
            <TextInput
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={FiSearch}
              className="w-full lg:w-1/3"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category Name</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((category) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FiFolder className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="font-medium text-gray-900">{category.categoryName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setDeletingId(category._id)
                              setShowDeleteModal(true)
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border-0"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Edit Modal */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} className="backdrop-blur-sm">
          <Modal.Header className="border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Edit Category</h3>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <TextInput
                  type="text"
                  value={editingCategory?.categoryName || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, categoryName: e.target.value })}
                  required
                  icon={FiFolder}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  Update Category
                </Button>
              </div>
            </form>
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
        {/* Add Delete Confirmation Modal */}
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
              <p>Are you sure you want to delete this category? This action cannot be undone.</p>
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
      </div>
    </div>
  )
}

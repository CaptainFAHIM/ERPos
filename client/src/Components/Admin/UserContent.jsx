"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiUsers,
  FiAlertCircle,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi"
import { Button, Modal, TextInput, Select, Toast } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function UserContent() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    role: "cashier",
    isActive: true,
  })
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:4000/api/users/")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      showToast("Failed to fetch users", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setUserData({ ...userData, [name]: value })
  }

  const handleSave = async () => {
    if (!userData.username.trim()) {
      showToast("Please enter a username", "warning")
      return
    }

    try {
      if (editingId) {
        await axios.put(`http://localhost:4000/api/users/${editingId}`, userData)
        showToast("User updated successfully")
      } else {
        await axios.post("http://localhost:4000/api/users/add", userData)
        showToast("User added successfully")
      }
      fetchUsers()
      setShowModal(false)
      setUserData({ username: "", password: "", role: "cashier", isActive: true })
      setEditingId(null)
    } catch (error) {
      console.error("Error saving user:", error)
      showToast("Failed to save user", "error")
    }
  }

  const handleEdit = (user) => {
    setUserData({
      username: user.username,
      password: "",
      role: user.role,
      isActive: user.isActive,
    })
    setEditingId(user._id)
    setShowModal(true)
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/users/${deletingId}`)
      showToast("User deleted successfully")
      fetchUsers()
      setShowDeleteModal(false)
      setDeletingId(null)
    } catch (error) {
      console.error("Error deleting user:", error)
      showToast("Failed to delete user", "error")
    }
  }

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.isActive).length
  const inactiveUsers = totalUsers - activeUsers
  const adminUsers = users.filter((user) => user.role === "admin").length

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
                <FiUsers className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-500">Manage your system users</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<FiUsers className="w-8 h-8 text-blue-100" />}
          color="bg-gradient-to-br from-blue-600 to-blue-800"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={<FiUserCheck className="w-8 h-8 text-emerald-100" />}
          color="bg-gradient-to-br from-emerald-600 to-emerald-800"
        />
        <StatCard
          title="Inactive Users"
          value={inactiveUsers}
          icon={<FiUserX className="w-8 h-8 text-red-100" />}
          color="bg-gradient-to-br from-red-600 to-red-800"
        />
        <StatCard
          title="Admin Users"
          value={adminUsers}
          icon={<FiShield className="w-8 h-8 text-purple-100" />}
          color="bg-gradient-to-br from-purple-600 to-purple-800"
        />
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput
            type="search"
            placeholder="Search users..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
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
                  : filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 transition-all duration-300"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setDeletingId(user._id)
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
          setUserData({ username: "", password: "", role: "cashier", isActive: true })
          setEditingId(null)
        }}
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">{editingId ? "Edit User" : "Add New User"}</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <TextInput
                id="username"
                name="username"
                value={userData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <TextInput
                id="password"
                name="password"
                type="password"
                value={userData.password}
                onChange={handleInputChange}
                placeholder={editingId ? "Enter new password (leave blank to keep current)" : "Enter password"}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select id="role" name="role" value={userData.role} onChange={handleInputChange} className="w-full">
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                id="isActive"
                name="isActive"
                value={userData.isActive.toString()}
                onChange={(e) => setUserData({ ...userData, isActive: e.target.value === "true" })}
                className="w-full"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={() => {
                setShowModal(false)
                setUserData({ username: "", password: "", role: "cashier", isActive: true })
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
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
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

// StatCard component
function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`rounded-full p-3 ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  )
}


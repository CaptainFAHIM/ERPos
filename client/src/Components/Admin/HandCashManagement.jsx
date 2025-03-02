"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { FiPlus, FiDollarSign, FiCalendar, FiClock, FiAlertCircle, FiSearch, FiFileText } from "react-icons/fi"
import { Button, Modal, TextInput, Toast, Textarea, Spinner } from "flowbite-react"
import { HiX } from "react-icons/hi"

export default function HandCashManagement() {
  const [withdrawals, setWithdrawals] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [cashData, setCashData] = useState({
    totalHandCash: 0,
    dailyHandCash: 0,
    totalWithdrawn: 0,
  })
  const [loadingWithdraw, setLoadingWithdraw] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [todayRes, withdrawalsRes, totalRes] = await Promise.all([
        axios.get("http://localhost:4000/api/handcash/today"),
        axios.get("http://localhost:4000/api/handcash/withdrawals"),
        axios.get("http://localhost:4000/api/handcash/total"),
      ])

      // Update data structure to match new API response
      const todayHandCash = todayRes.data.todayHandCash || {}
      const totalWithdrawalsToday = todayRes.data.totalWithdrawalsToday || 0

      setCashData({
        totalHandCash: totalRes.data.totalHandCash || 0,
        dailyHandCash: todayHandCash.closingBalance || 0,
        totalWithdrawn: withdrawalsRes.data.totalWithdrawals || 0,
      })

      // Process withdrawals from the new API format
      const withdrawalData = withdrawalsRes.data.withdrawals || []
      const processedWithdrawals = withdrawalData.map((w) => ({
        _id: w._id || String(Math.random()),
        amount: Number(w.amount) || 0,
        description: String(w.reason || "No description"),
        date: w.date || new Date().toISOString(),
      }))
      setWithdrawals(processedWithdrawals)
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Failed to fetch data", "error")
      // Initialize with empty data on error
      setWithdrawals([])
      setCashData({
        totalHandCash: 0,
        dailyHandCash: 0,
        totalWithdrawn: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "warning")
      return
    }

    try {
      setLoadingWithdraw(true)
      await axios.post("http://localhost:4000/api/handcash/withdraw", {
        amount: Number.parseFloat(amount),
        reason: description.trim() || "Cash Withdrawal", // Changed from 'description' to 'reason' to match API
      })

      showToast("Withdrawal successful")
      setShowModal(false)
      setAmount("")
      setDescription("")
      fetchData() // Refresh data after withdrawal
    } catch (error) {
      console.error("Error processing withdrawal:", error)
      showToast(error.response?.data?.message || "Failed to process withdrawal", "error")
    } finally {
      setLoadingWithdraw(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount) => {
    return `Tk ${Number(amount).toFixed(2)}`
  }

  // Safe filtering of withdrawals
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!withdrawal) return false
    const searchLower = (searchTerm || "").toLowerCase()
    const description = (withdrawal.description || "").toLowerCase()
    return description.includes(searchLower)
  })

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
                <FiDollarSign className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hand Cash Management</h1>
              <p className="text-sm text-gray-500">Manage withdrawals and view history</p>
            </div>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            New Withdrawal
          </Button>
        </div>
      </motion.div>

      {/* Cash Summary Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        {/* Total Hand Cash */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <FiDollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hand Cash</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl font-bold text-gray-900">{formatCurrency(cashData.totalHandCash)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Hand Cash */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <FiCalendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Hand Cash</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl font-bold text-gray-900">{formatCurrency(cashData.dailyHandCash)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-600 p-2 rounded-lg">
              <FiFileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Withdrawn</p>
              {loading ? (
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xl font-bold text-gray-900">{formatCurrency(cashData.totalWithdrawn)}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <TextInput
            type="search"
            placeholder="Search withdrawals by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full lg:w-1/3"
          />
        </div>
      </motion.div>

      {/* Withdrawal History Table */}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {loading ? (
                  [...Array(3)].map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No withdrawal history found
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((withdrawal, index) => (
                    <motion.tr
                      key={withdrawal._id || index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-gray-400 w-4 h-4" />
                          <span className="text-sm text-gray-600">{formatDate(withdrawal.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{withdrawal.description}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-red-600">{formatCurrency(withdrawal.amount)}</span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Withdrawal Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setAmount("")
          setDescription("")
        }}
        className="backdrop-blur-sm"
      >
        <Modal.Header className="border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">New Withdrawal</h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (Tk)
              </label>
              <TextInput
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Purpose of withdrawal"
                rows={3}
                className="w-full"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 flex items-start gap-2">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Available balance: <span className="font-semibold">{formatCurrency(cashData.totalHandCash)}</span>
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-t border-gray-100">
          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={() => {
                setShowModal(false)
                setAmount("")
                setDescription("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={loadingWithdraw}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
            >
              {loadingWithdraw ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Withdraw"
              )}
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


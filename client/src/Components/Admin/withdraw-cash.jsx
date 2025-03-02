"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaHandHoldingUsd, FaSpinner } from "react-icons/fa"
import { Alert } from "flowbite-react"

export default function WithdrawCash() {
  const [handCash, setHandCash] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    fetchHandCash()
  }, [])

  const fetchHandCash = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:4000/api/report/handcash")
      if (!response.ok) throw new Error("Failed to fetch hand cash")
      const data = await response.json()
      setHandCash(data.handCash)
    } catch (error) {
      console.error("Error fetching hand cash:", error)
      showAlert("error", "Failed to fetch hand cash balance")
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (type, message) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()

    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      showAlert("error", "Please enter a valid amount")
      return
    }

    try {
      setWithdrawing(true)
      const response = await fetch("http://localhost:4000/api/report/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number.parseFloat(withdrawAmount) }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Withdrawal failed")
      }

      setHandCash(data.remainingBalance)
      setWithdrawAmount("")
      showAlert("success", "Withdrawal successful")
    } catch (error) {
      console.error("Error withdrawing cash:", error)
      showAlert("error", error.message || "Failed to withdraw cash")
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-green-500 to-green-600" />

      {alert && (
        <Alert color={alert.type === "error" ? "failure" : "success"} className="mb-4">
          {alert.message}
        </Alert>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 text-green-600">
          <FaHandHoldingUsd className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Hand Cash Management</h3>
          <p className="text-sm text-gray-500">
            Current Balance: {loading ? "Loading..." : `Tk ${handCash.toFixed(2)}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Withdrawal Amount
          </label>
          <input
            id="withdrawAmount"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount to withdraw"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        <button
          type="submit"
          disabled={withdrawing || loading}
          className={`
            w-full px-4 py-2 rounded-lg font-medium text-white
            transition-all duration-200
            ${
              withdrawing || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
            }
          `}
        >
          {withdrawing ? (
            <span className="flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin h-5 w-5" />
              Processing...
            </span>
          ) : (
            "Withdraw Cash"
          )}
        </button>
      </form>
    </motion.div>
  )
}


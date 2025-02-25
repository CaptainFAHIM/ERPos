"use client"

import { useState } from "react"
import { FaMoneyBillWave, FaHistory, FaChevronDown, FaWallet } from "react-icons/fa"
import { RiMoneyDollarCircleLine, RiBankLine, RiVisaLine } from "react-icons/ri"
import { HiCurrencyBangladeshi } from "react-icons/hi2"
import { useFloating, offset, flip, shift } from "@floating-ui/react"

export default function ProfitWithdrawal() {
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank")
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const { refs, floatingStyles } = useFloating({
    placement: "bottom",
    middleware: [offset(10), flip(), shift()],
  })

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setAmount("")
    }, 1500)
  }

  const recentTransactions = [
    { id: 1, amount: 15000, date: "2024-02-20", status: "completed" },
    { id: 2, amount: 23000, date: "2024-02-15", status: "completed" },
    { id: 3, amount: 8000, date: "2024-02-10", status: "pending" },
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <RiMoneyDollarCircleLine className="text-2xl text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600">Total Balance</p>
                <h3 className="text-2xl font-bold text-gray-900">৳52,800</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <FaWallet className="text-2xl text-emerald-600" />
              </div>
              <div>
                <p className="text-gray-600">Available</p>
                <h3 className="text-2xl font-bold text-gray-900">৳35,450</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <FaHistory className="text-2xl text-amber-600" />
              </div>
              <div>
                <p className="text-gray-600">Pending</p>
                <h3 className="text-2xl font-bold text-gray-900">৳8,000</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Withdrawal Amount</label>
                <div className="relative">
                  <HiCurrencyBangladeshi className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl 
                             text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 
                             focus:border-transparent transition-all"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Withdrawal Method</label>
                <div className="relative" ref={refs.setReference}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 
                             border border-gray-200 rounded-xl text-gray-900 hover:bg-gray-100 
                             transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {method === "bank" ? (
                        <RiBankLine className="text-xl text-purple-600" />
                      ) : (
                        <RiVisaLine className="text-xl text-purple-600" />
                      )}
                      <span className="capitalize">{method}</span>
                    </div>
                    <FaChevronDown
                      className={`text-gray-400 transition-transform duration-200 
                                            ${showDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showDropdown && (
                    <div
                      ref={refs.setFloating}
                      style={floatingStyles}
                      className="absolute z-10 w-full bg-white border border-gray-200 
                               rounded-xl shadow-lg"
                    >
                      <div
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setMethod("bank")
                          setShowDropdown(false)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <RiBankLine className="text-xl text-purple-600" />
                          <span className="text-gray-900">Bank Transfer</span>
                        </div>
                      </div>
                      <div
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setMethod("card")
                          setShowDropdown(false)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <RiVisaLine className="text-xl text-purple-600" />
                          <span className="text-gray-900">Card</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-4 rounded-xl text-white font-medium 
                  ${
                    isLoading
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
                  } transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-purple-200`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <FaMoneyBillWave className="text-xl" />
                    Withdraw Funds
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <FaHistory className="text-2xl text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl 
                         hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaMoneyBillWave className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Withdrawal - ৳{transaction.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium
                    ${
                      transaction.status === "completed"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                    }`}
                >
                  {transaction.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


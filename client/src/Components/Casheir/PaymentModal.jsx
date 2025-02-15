"use client"

import { useState } from "react"
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt } from "react-icons/fa"
import { usePOSContext } from "./context/POSContext"

const PaymentModal = () => {
  const { calculateTotal, settlePayment, setShowPaymentModal } = usePOSContext()
  const [amount, setAmount] = useState("")
  const [paymentType, setPaymentType] = useState("cash")

  const handleSubmit = (e) => {
    e.preventDefault()
    const paymentAmount = Number.parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount < calculateTotal()) {
      alert("Please enter a valid payment amount")
      return
    }
    settlePayment(paymentAmount, paymentType)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
            <div className="text-4xl font-bold text-green-600">৳{calculateTotal().toFixed(2)}</div>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">৳</span>
              </div>
              <input
                type="number"
                step="0.01"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "cash", icon: FaMoneyBillWave, label: "Cash" },
                { value: "card", icon: FaCreditCard, label: "Card" },
                { value: "mobile", icon: FaMobileAlt, label: "Mobile" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentType(value)}
                  className={`flex flex-col items-center justify-center p-3 border rounded-md ${
                    paymentType === value
                      ? "bg-indigo-100 border-indigo-500 text-indigo-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={24} className={paymentType === value ? "text-indigo-600" : "text-gray-500"} />
                  <span className={`mt-2 text-sm ${paymentType === value ? "text-indigo-600" : "text-gray-700"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentModal


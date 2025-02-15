"use client"

import React from "react"

const SettlePayment = ({ total, onConfirm }) => {
  const [paymentAmount, setPaymentAmount] = React.useState("")
  const [paymentType, setPaymentType] = React.useState("cash")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (Number.parseFloat(paymentAmount) >= total) {
      onConfirm(Number.parseFloat(paymentAmount), paymentType)
    } else {
      alert("Payment amount must be greater than or equal to the total.")
    }
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Settle Payment</h2>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-xl font-semibold text-gray-700">Total Amount</p>
        <p className="text-3xl font-bold text-indigo-600">৳{total.toFixed(2)}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700">
            Payment Amount
          </label>
          <input
            type="number"
            id="paymentAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
            Payment Type
          </label>
          <select
            id="paymentType"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Payment</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Confirm Payment
        </button>
      </form>
    </div>
  )
}

export default SettlePayment


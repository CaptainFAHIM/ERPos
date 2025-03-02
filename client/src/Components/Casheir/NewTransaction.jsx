"use client"

import { useState } from "react"
import { FaPlus, FaMinus, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa"
import { usePOSContext } from "./context/POSContext"

const NewTransaction = () => {
  const {
    cart,
    updateCartItemQuantity,
    removeCartItem,
    discount,
    updateDiscount,
    calculateSubtotal,
    calculateTotal,
    customerName,
    setCustomerName,
    customerNumber,
    setCustomerNumber,
    paymentMethod,
    setPaymentMethod,
    settlePayment,
    products,
    transactionNo,
    setTransactionNo,
  } = usePOSContext()

  const [showPurchasePrice, setShowPurchasePrice] = useState({})

  const handleDiscountChange = (e) => {
    const newDiscount = Number.parseFloat(e.target.value) || 0
    updateDiscount(newDiscount)
  }

  const handleSettlePayment = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items before settling payment.")
      return
    }

    settlePayment()

    // Clear all inputs after successful payment
    setCustomerName("")
    setCustomerNumber("")
    setPaymentMethod("cash")
    updateDiscount(0)
    setShowPurchasePrice({})

    // Generate new transaction number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    const newTransactionNo = `TXN${timestamp}${random}`

    // Update transaction number in context
    setTransactionNo(newTransactionNo)
  }

  const togglePurchasePrice = (productId) => {
    setShowPurchasePrice((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="transactionNo" className="block text-sm font-medium text-gray-700">
              Transaction No
            </label>
            <input
              type="text"
              id="transactionNo"
              value={transactionNo}
              readOnly
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700">
              Customer Number
            </label>
            <input
              type="text"
              id="customerNumber"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Payment</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cart.map((item) => {
              const product = products.find((p) => p._id === item.productId)
              return (
                <tr key={item.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product?.description}</div>
                        <div className="text-sm text-gray-500">{product?.barcode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      ৳{product?.sellPrice.toFixed(2)}
                      <button
                        onClick={() => togglePurchasePrice(product._id)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPurchasePrice[product._id] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {showPurchasePrice[product._id] && (
                      <div className="text-xs text-gray-500 mt-1">Purchase: ৳{product?.purchasePrice.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                        className="text-red-500 hover:text-red-700 mr-2"
                      >
                        <FaMinus />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCartItemQuantity(item.productId, Number.parseInt(e.target.value))}
                        className="w-16 text-center border rounded-md"
                      />
                      <button
                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                        className="text-green-500 hover:text-green-700 ml-2"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ৳{item.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => removeCartItem(item.productId)} className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {cart.length === 0 && (
        <div className="text-center py-8 text-gray-500">No items in the cart. Scan or search for products to add.</div>
      )}
      <div className="bg-gray-100 px-4 py-3 sm:px-6 sticky bottom-0">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>৳{calculateSubtotal().toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center text-base font-medium text-gray-900 mt-2">
          <p>Discount</p>
          <div className="flex items-center">
            <span className="mr-2">৳</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={discount || ""}
              onChange={handleDiscountChange}
              className="w-24 text-right border rounded-md p-1"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
          <p>Total</p>
          <p>৳{calculateTotal().toFixed(2)}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={handleSettlePayment}
            className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Settle Payment
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewTransaction


"use client"

import { usePOSContext } from "./context/POSContext"

const ClearCart = () => {
  const { clearCart, setActiveTab } = usePOSContext()

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Clear Cart</h2>
      <p className="mb-6 text-gray-600">Are you sure you want to clear all items from the cart?</p>
      <div className="flex justify-end space-x-4">
        <button
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-200 ease-in-out"
          onClick={() => setActiveTab("New Transaction")}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200 ease-in-out"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>
    </div>
  )
}

export default ClearCart


"use client"

import { FaPlus, FaMinus, FaTrash } from "react-icons/fa"
import { usePOSContext } from "./context/POSContext"

const NewTransaction = () => {
  const {
    cart,
    updateCartItemQuantity,
    updateCartItemDiscount,
    removeCartItem,
    globalDiscount,
    updateGlobalDiscount,
    calculateSubtotal,
    calculateTotalDiscount,
    calculateTotal,
  } = usePOSContext()

  const handleGlobalDiscountChange = (e) => {
    const newDiscount = Number.parseFloat(e.target.value) || 0
    updateGlobalDiscount(newDiscount)
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Qty</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cart.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.description}</div>
                      <div className="text-sm text-gray-500">{item.barcode}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{item.sellPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => updateCartItemQuantity(item._id, item.qty - 1)}
                      className="text-red-500 hover:text-red-700 mr-2"
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateCartItemQuantity(item._id, Number.parseInt(e.target.value))}
                      className="w-16 text-center border rounded-md"
                    />
                    <button
                      onClick={() => updateCartItemQuantity(item._id, item.qty + 1)}
                      className="text-green-500 hover:text-green-700 ml-2"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount || ""}
                    onChange={(e) => updateCartItemDiscount(item._id, Number.parseFloat(e.target.value))}
                    className="w-20 text-center border rounded-md"
                    placeholder="0.00"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ৳{(item.sellPrice * item.qty - (item.discount || 0)).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => removeCartItem(item._id)} className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cart.length === 0 && (
        <div className="text-center py-8 text-gray-500">No items in the cart. Scan or search for products to add.</div>
      )}
      {cart.length > 0 && (
        <div className="bg-gray-100 px-4 py-3 sm:px-6">
          <div className="flex justify-between text-base font-medium text-gray-900">
            <p>Subtotal</p>
            <p>৳{calculateSubtotal().toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center text-base font-medium text-gray-900 mt-2">
            <p>Global Discount</p>
            <div className="flex items-center">
              <span className="mr-2">৳</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={globalDiscount || ""}
                onChange={handleGlobalDiscountChange}
                className="w-24 text-right border rounded-md p-1"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
            <p>Total Discount</p>
            <p>৳{calculateTotalDiscount().toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
            <p>Total</p>
            <p>৳{calculateTotal().toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewTransaction


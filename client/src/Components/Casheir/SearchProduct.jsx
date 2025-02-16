"use client"

import { useState } from "react"
import { usePOSContext } from "./context/POSContext"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const SearchProduct = () => {
  const { products, searchTerm, setSearchTerm, addToCart, errorMessage } = usePOSContext()
  const [showPurchasePrice, setShowPurchasePrice] = useState({})

  const togglePurchasePrice = (productId) => {
    setShowPurchasePrice((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Search Product</h2>
      <input
        type="text"
        className="w-full p-2 border rounded-md mb-4"
        placeholder="Enter product name or barcode..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Barcode</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products
              .filter(
                (product) =>
                  product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.barcode.includes(searchTerm),
              )
              .map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.barcode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brand}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      ৳{product.sellPrice.toFixed(2)}
                      <button
                        onClick={() => togglePurchasePrice(product._id)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPurchasePrice[product._id] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {showPurchasePrice[product._id] && (
                      <div className="text-xs text-gray-500 mt-1">Purchase: ৳{product.purchasePrice.toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className={`px-3 py-1 rounded ${
                        product.totalQuantity > 0
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => product.totalQuantity > 0 && addToCart(product)}
                      disabled={product.totalQuantity <= 0}
                    >
                      {product.totalQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {errorMessage && (
        <div className="fixed bottom-4 right-4 p-4 rounded-md bg-red-500 text-white">{errorMessage}</div>
      )}
    </div>
  )
}

export default SearchProduct


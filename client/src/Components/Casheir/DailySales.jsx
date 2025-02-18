"use client"

import { useState, useEffect } from "react"
import { usePOSContext } from "./context/POSContext" // Assuming you have this context
import { FaEye, FaUndo } from "react-icons/fa"

const DailySales = () => {
  const { dailySales, setDailySales } = usePOSContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSale, setSelectedSale] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [returnQuantity, setReturnQuantity] = useState(1)
  const [returnProductId, setReturnProductId] = useState("")
  const [returnTransactionNo, setReturnTransactionNo] = useState("")

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/sales/")
        if (!response.ok) {
          throw new Error("Failed to fetch sales data")
        }
        const data = await response.json()

        // Filter sales for today
        const today = new Date().toDateString()
        const todaySales = data.filter((sale) => new Date(sale.createdAt).toDateString() === today)
        setDailySales(todaySales)
        setIsLoading(false)
      } catch (error) {
        setError(error.message)
        setIsLoading(false)
      }
    }

    fetchDailySales()
  }, [setDailySales])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // Function to open modal with selected sale details
  const openModal = (sale) => {
    setSelectedSale(sale)
    setIsModalOpen(true)
  }

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedSale(null)
  }

  // Function to open return modal
  const openReturnModal = (sale, productId) => {
    setReturnTransactionNo(sale.transactionNo)
    setReturnProductId(productId)
    setIsReturnModalOpen(true)
  }

  // Function to close return modal
  const closeReturnModal = () => {
    setIsReturnModalOpen(false)
    setReturnQuantity(1)
    setReturnProductId("")
    setReturnTransactionNo("")
  }

  // Function to handle product return
  const handleReturn = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/sales/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionNo: returnTransactionNo,
          productId: returnProductId,
          returnQuantity: returnQuantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process return")
      }

      const result = await response.json()
      console.log(result.message)

      // Update the dailySales state with the returned sale
      setDailySales((prevSales) =>
        prevSales.map((sale) => (sale.transactionNo === result.updatedSale.transactionNo ? result.updatedSale : sale)),
      )

      closeReturnModal()
      // Optionally, you can show a success message to the user
    } catch (error) {
      console.error("Error processing return:", error)
      // Optionally, you can show an error message to the user
    }
  }

  // Calculate today's total sales amount
  const totalSalesAmount = dailySales.reduce((sum, sale) => sum + (Number(sale.finalAmount) || 0), 0).toFixed(2)

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Daily Sales</h2>

      {/* Total Sales Summary Card at the Top */}
      <div className="bg-indigo-600 text-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Today's Total Sales</h3>
        <p className="text-xl font-bold">৳{totalSalesAmount}</p>
      </div>

      {/* Sales Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Transaction No</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dailySales.map((sale) => (
              <tr key={sale._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.transactionNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(sale.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.paymentMethod}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ৳{sale.finalAmount ? sale.finalAmount.toFixed(2) : "0.00"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <button className="text-indigo-600 hover:text-indigo-800 mr-2" onClick={() => openModal(sale)}>
                    <FaEye className="inline-block mr-1" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Sale Details */}
      {isModalOpen && selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-indigo-600">Sale Details</h3>
            <p>
              <strong>Transaction No:</strong> {selectedSale.transactionNo}
            </p>
            <p>
              <strong>Invoice No:</strong> {selectedSale.invoiceNo}
            </p>
            <p>
              <strong>Date:</strong> {new Date(selectedSale.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Payment Method:</strong> {selectedSale.paymentMethod}
            </p>
            <p>
              <strong>Total Amount:</strong> ৳{selectedSale.finalAmount ? selectedSale.finalAmount.toFixed(2) : "0.00"}
            </p>
            <p>
              <strong>Customer:</strong> {selectedSale.customerName || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {selectedSale.customerNumber || "N/A"}
            </p>

            {/* Purchased Items with Barcode */}
            <h4 className="text-lg font-semibold mt-4">Purchased Items</h4>
            <ul className="list-none space-y-2 text-sm text-gray-700">
              {selectedSale.products.map((item, index) => (
                <li key={index} className="flex items-center space-x-3 p-2 border rounded-md shadow-sm">
                  <img
                    src={`https://barcode.tec-it.com/barcode.ashx?data=${item.productId.barcode}&code=Code128`}
                    alt="Barcode"
                    className="w-24 h-12"
                  />
                  <div>
                    <p>
                      <strong>{item.productId.description}</strong>
                    </p>
                    <p>
                      <strong>Barcode:</strong> {item.productId.barcode}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity} pcs
                    </p>
                  </div>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => openReturnModal(selectedSale, item.productId._id)}
                  >
                    <FaUndo className="inline-block mr-1" /> Return
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-800"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal for Product Return */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-indigo-600">Return Product</h3>
            <p>
              <strong>Transaction No:</strong> {returnTransactionNo}
            </p>
            <p>
              <strong>Product ID:</strong> {returnProductId}
            </p>
            <div className="mt-4">
              <label htmlFor="returnQuantity" className="block text-sm font-medium text-gray-700">
                Return Quantity
              </label>
              <input
                type="number"
                id="returnQuantity"
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(Math.max(1, Number.parseInt(e.target.value)))}
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                onClick={closeReturnModal}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-800"
                onClick={handleReturn}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DailySales


"use client"

import { useState, useEffect, useRef } from "react"
import { FaGripLines } from "react-icons/fa"
import { usePOSContext } from "./context/POSContext"

const TransactionDetails = () => {
  const { transactionNo, time, handleBarcodeSubmit, calculateTotal, calculateTotalDiscount } = usePOSContext()

  const [barcode, setBarcode] = useState("")
  const [error, setError] = useState("")
  const detailsRef = useRef(null)

  useEffect(() => {
    const resizeableElem = detailsRef.current
    let startX, startWidth

    const initResize = (e) => {
      startX = e.clientX
      startWidth = Number.parseInt(document.defaultView.getComputedStyle(resizeableElem).width, 10)
      document.documentElement.addEventListener("mousemove", resize)
      document.documentElement.addEventListener("mouseup", stopResize)
    }

    const resize = (e) => {
      const width = startWidth - (e.clientX - startX)
      resizeableElem.style.width = `${width}px`
    }

    const stopResize = () => {
      document.documentElement.removeEventListener("mousemove", resize)
      document.documentElement.removeEventListener("mouseup", stopResize)
    }

    const resizer = resizeableElem.querySelector(".resizer")
    resizer.addEventListener("mousedown", initResize)

    return () => {
      resizer.removeEventListener("mousedown", initResize)
    }
  }, [])

  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value)
    setError("")
  }

  const onBarcodeSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:4000/api/productlist?barcode=${barcode}`)
      if (!response.ok) {
        throw new Error("Failed to fetch product")
      }
      const products = await response.json()
      if (products.length > 0) {
        const success = handleBarcodeSubmit(barcode)
        if (success) {
          setBarcode("")
          setError("")
        } else {
          setError("Failed to add product to cart. Please try again.")
        }
      } else {
        setError("Product not found. Please check the barcode and try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div ref={detailsRef} className="bg-white shadow-lg rounded-lg p-6 w-80 relative">
      <div className="resizer absolute left-0 top-0 h-full w-1 cursor-ew-resize flex items-center justify-center">
        <FaGripLines className="text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Transaction Details</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-gray-600">Transaction No</p>
          <p className="text-lg">{transactionNo}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Date</p>
          <p className="text-lg">{time.toLocaleDateString()}</p>
        </div>
        <form onSubmit={onBarcodeSubmit}>
          <div>
            <p className="font-semibold text-gray-600">Barcode</p>
            <input
              type="text"
              className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Scan barcode..."
              value={barcode}
              onChange={handleBarcodeChange}
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </form>
      </div>
      <div className="mt-6 space-y-2">
        <p className="flex justify-between">
          <span className="text-gray-600">Sales Total:</span>
          <span className="font-semibold">৳{calculateTotal().toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">Total Discount:</span>
          <span className="font-semibold">
            {calculateTotalDiscount() > 0 ? `৳${calculateTotalDiscount().toFixed(2)}` : "-"}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">VAT:</span>
          <span className="font-semibold">৳0.00</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-600">Net Total:</span>
          <span className="font-semibold">৳{(calculateTotal() - calculateTotalDiscount()).toFixed(2)}</span>
        </p>
      </div>
      <div className="mt-6 bg-indigo-600 text-white text-center p-2 text-xl font-bold rounded-md">
        {time.toLocaleTimeString()}
      </div>
    </div>
  )
}

export default TransactionDetails


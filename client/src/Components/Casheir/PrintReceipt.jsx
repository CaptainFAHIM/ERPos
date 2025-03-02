"use client"

import { useEffect, useState } from "react"
import { usePOSContext } from "./context/POSContext"
import { X, Printer } from "lucide-react"
import JsBarcode from "jsbarcode"
import { useSelector } from "react-redux"

const PrintReceipt = () => {
  const { currentReceipt, setShowPrintReceipt, products } = usePOSContext()
  const [storeSettings, setStoreSettings] = useState(null)
  const [barcodeUrl, setBarcodeUrl] = useState("")

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.user.currentUser)

  // Fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/storeSettings")
        const data = await response.json()
        setStoreSettings(data)
      } catch (error) {
        console.error("Error fetching store settings:", error)
      }
    }

    fetchStoreSettings()
  }, [])

  // Generate barcode
  useEffect(() => {
    if (currentReceipt?.transactionNo) {
      const canvas = document.createElement("canvas")
      JsBarcode(canvas, currentReceipt.transactionNo, {
        format: "CODE128",
        width: 1.5,
        height: 40,
        displayValue: true,
        fontSize: 10,
        margin: 5,
        background: "#ffffff",
        lineColor: "#000000",
        textMargin: 2,
      })
      setBarcodeUrl(canvas.toDataURL("image/png"))
    }
  }, [currentReceipt?.transactionNo])

  // Handle print and keyboard shortcuts
  const handlePrint = () => {
    window.print()
    setShowPrintReceipt(false)
  }

  // Add keyboard listener for Enter key
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handlePrint()
      }
    }

    // Add event listener
    window.addEventListener("keydown", handleKeyPress)

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, []) // Updated dependency array

  if (!currentReceipt || !storeSettings) return null

  // Find product details for each item in the receipt
  const receiptItems = currentReceipt.products.map((item) => {
    const product = products.find((p) => p._id === item.productId)
    return {
      ...item,
      product: product || { description: "Product not found", sellPrice: 0 },
    }
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center print:bg-white overflow-auto print:items-start">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 print:shadow-none print:w-full print:p-4">
        {/* Print-only logo placeholder */}
        <div className="hidden print:block text-center mb-4">
          <img src="../../../public/BOOK PALACE-2-LOGO.png" alt="Shop Logo" className="mx-auto h-16 w-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{storeSettings.storeName}</h1>
          <p className="text-sm text-gray-600">{storeSettings.address}</p>
          {storeSettings.phoneNumbers?.map((phone, index) => (
            <p key={index} className="text-sm text-gray-600">
              Phone: {phone}
            </p>
          ))}
          {storeSettings.emails?.map((email, index) => (
            <p key={index} className="text-sm text-gray-600">
              Email: {email}
            </p>
          ))}
          <div className="mt-2 text-sm text-gray-500">
            {new Date(currentReceipt.createdAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Close button - hidden when printing */}
        <button
          onClick={() => setShowPrintReceipt(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 print:hidden"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Receipt Details with Barcode */}
        <div className="space-y-4">
          <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
            {/* Left side details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-600">Time:</p>
                <p>{new Date(currentReceipt.createdAt).toLocaleTimeString()}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Cashier:</p>
                <p>{currentUser?.username || "N/A"}</p>
              </div>
            </div>

            {/* Right side barcode */}
            <div className="flex flex-col items-end">
              <img src={barcodeUrl || "/placeholder.svg"} alt="Transaction Barcode" className="max-w-[120px]" />
            </div>
          </div>

          {/* Products Table */}
          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-gray-200">
                  <th className="py-2 text-left font-medium text-gray-600">Item</th>
                  <th className="py-2 text-right font-medium text-gray-600">Qty</th>
                  <th className="py-2 text-right font-medium text-gray-600">Price</th>
                  <th className="py-2 text-right font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody className="border-b border-gray-200">
                {receiptItems.map((item, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="py-2 text-gray-800">{item.product.description}</td>
                    <td className="py-2 text-right text-gray-800">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-800">৳{item.product.sellPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-800">
                      ৳{(item.quantity * item.product.sellPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>৳{currentReceipt.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount</span>
              <span>৳{currentReceipt.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total</span>
              <span>৳{currentReceipt.finalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className="capitalize">{currentReceipt.paymentMethod}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm">
              <p className="text-gray-600">Customer: {currentReceipt.customerName || "Walk-in Customer"}</p>
              {currentReceipt.customerNumber && <p className="text-gray-600">Phone: {currentReceipt.customerNumber}</p>}
            </div>
          </div>

          {/* Footer with Invoice Format */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="font-medium text-gray-800">Thank you for your purchase!</p>
            {storeSettings.invoiceFormats?.map((format, index) => (
              <p key={index} className="font-medium text-xs text-gray-500 mt-1">
                {format}
              </p>
            ))}
          </div>

          {/* Print Button with Keyboard Shortcut Hint */}
          <button
            onClick={handlePrint}
            className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 
              transition-colors duration-200 flex items-center justify-center gap-2 print:hidden group"
          >
            <Printer className="h-5 w-5" />
            <span>Print Receipt</span>
            <span className="text-xs opacity-75 ml-2">(or press Enter)</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrintReceipt


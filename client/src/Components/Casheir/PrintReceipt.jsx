"use client"

import { usePOSContext } from "./context/POSContext"

const PrintReceipt = () => {
  const { currentReceipt, setShowPrintReceipt } = usePOSContext()

  const handlePrint = () => {
    window.print()
    setShowPrintReceipt(false)
  }

  if (!currentReceipt) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Your Shop Name</h1>
          <p className="text-sm">123 Main Street, City, Country, ZIP</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Receipt</h2>
          <button onClick={() => setShowPrintReceipt(false)} className="text-gray-600 hover:text-gray-800">
            Close
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>Transaction No:</p>
            <p className="text-right">{currentReceipt.transactionNo}</p>
            <p>Date:</p>
            <p className="text-right">{currentReceipt.date}</p>
            <p>Subtotal:</p>
            <p className="text-right">৳{currentReceipt.subtotal.toFixed(2)}</p>
            <p>Total Discount:</p>
            <p className="text-right">৳{currentReceipt.totalDiscount.toFixed(2)}</p>
            <p>VAT:</p>
            <p className="text-right">৳{currentReceipt.vat.toFixed(2)}</p>
            <p className="font-semibold">Total:</p>
            <p className="text-right font-semibold">৳{currentReceipt.total.toFixed(2)}</p>
            <p>Payment Amount:</p>
            <p className="text-right">৳{currentReceipt.paymentAmount.toFixed(2)}</p>
            <p>Change:</p>
            <p className="text-right">৳{currentReceipt.change.toFixed(2)}</p>
            <p>Payment Type:</p>
            <p className="text-right">{currentReceipt.paymentType}</p>
          </div>
          <table className="w-full text-sm">
            <thead className="border-t border-b">
              <tr>
                <th className="text-left py-1">Description</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-right py-1">Price</th>
                <th className="text-right py-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentReceipt.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1">{item.description}</td>
                  <td className="text-right py-1">{item.qty}</td>
                  <td className="text-right py-1">৳{item.sellPrice.toFixed(2)}</td>
                  <td className="text-right py-1">৳{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <button
            onClick={handlePrint}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full"
          >
            Print Receipt
          </button>
        </div>
        <div className="text-center mt-4 pt-4 border-t">
          <p className="text-sm font-semibold">Thank you for shopping with us!</p>
          <p className="text-xs">We appreciate your business.</p>
        </div>
      </div>
    </div>
  )
}

export default PrintReceipt


"use client"

import { useRef } from "react"
import ReactToPrint from "react-to-print"

const PrintInvoice = ({ invoice, onClose }) => {
  const componentRef = useRef()

  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>Invoice data is not available.</p>
          <button onClick={onClose} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <div ref={componentRef}>
          <h2 className="text-2xl font-bold mb-4">Invoice</h2>
          <p>Transaction No: {invoice.transactionNo}</p>
          <p>Date: {invoice.date}</p>
          <p>Payment Type: {invoice.paymentType}</p>
          <table className="w-full mt-4">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.qty}</td>
                  <td>৳{item.sellPrice.toFixed(2)}</td>
                  <td>৳{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-bold">Total: ৳{invoice.total.toFixed(2)}</p>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <ReactToPrint
            trigger={() => <button className="bg-blue-500 text-white p-2 rounded">Print Invoice</button>}
            content={() => componentRef.current}
            onAfterPrint={onClose}
          />
          <button onClick={onClose} className="bg-gray-300 text-black p-2 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrintInvoice


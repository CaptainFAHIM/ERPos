"use client"

import { usePOSContext } from "./context/POSContext"

const DailySales = () => {
  const { dailySales } = usePOSContext()

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Daily Sales</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Transaction No</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Payment Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dailySales.map((sale) => (
              <tr key={sale.transactionNo} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.transactionNo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{sale.total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.paymentType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
        <p className="text-xl font-semibold text-indigo-600">
          Today's total sales: ৳{dailySales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default DailySales


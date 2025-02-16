import { Card } from "flowbite-react";
import { FaShoppingCart, FaDollarSign, FaChartLine, FaUsers } from "react-icons/fa";

export default function SummaryReportContent() {
  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Summary Report</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-5">
        <div className="flex-1">
          <p className="text-sm text-gray-500">Date Range</p>
          <p className="text-lg font-semibold text-gray-800">February 2025</p>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-lg font-semibold text-gray-800">1,245</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <Card>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-bold">Total Sales</h5>
            <FaShoppingCart className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold">৳120,450</p>
        </Card>

        {/* Total Expenses */}
        <Card>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-bold">Total Expenses</h5>
            <FaDollarSign className="text-red-600" size={24} />
          </div>
          <p className="text-3xl font-bold">৳80,000</p>
        </Card>

        {/* Profit */}
        <Card>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-bold">Profit</h5>
            <FaChartLine className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold">৳40,450</p>
        </Card>

        {/* Number of Customers */}
        <Card>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-bold">Customers</h5>
            <FaUsers className="text-purple-600" size={24} />
          </div>
          <p className="text-3xl font-bold">305</p>
        </Card>
      </div>

      <div className="mt-5 text-center">
        <button className="bg-blue-600 text-white py-2 px-4 rounded-lg">View Detailed Report</button>
      </div>
    </div>
  );
}

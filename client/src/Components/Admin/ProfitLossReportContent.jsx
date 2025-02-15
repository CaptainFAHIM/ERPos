import { Card } from "flowbite-react";
import { FaChartLine, FaMoneyBillWave } from "react-icons/fa";

export default function ProfitLossReportContent() {
  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Profit & Loss Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Total Revenue</h5>
            <FaChartLine className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">$50,567</p>
          <p className="text-sm text-gray-600">+10.5% from last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Total Expenses</h5>
            <FaMoneyBillWave className="text-red-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-red-600">$30,345</p>
          <p className="text-sm text-gray-600">+5.2% from last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Net Profit</h5>
            <FaChartLine className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">$20,222</p>
          <p className="text-sm text-gray-600">+15.8% from last month</p>
        </Card>
      </div>
    </div>
  );
}

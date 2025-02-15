import { Card } from "flowbite-react";
import { FaShoppingCart, FaDollarSign } from "react-icons/fa";

export default function SummaryReportContent() {
  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Summary Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-bold">Total Sales</h5>
            <FaShoppingCart className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold">$120,450</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-bold">Total Expenses</h5>
            <FaDollarSign className="text-red-600" size={24} />
          </div>
          <p className="text-3xl font-bold">$80,000</p>
        </Card>
      </div>
    </div>
  );
}

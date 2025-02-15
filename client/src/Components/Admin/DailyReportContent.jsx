import { Card } from "flowbite-react";
import { FaCalendarDay } from "react-icons/fa";

export default function DailyReportContent() {
  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Daily Sales Report</h1>

      <Card>
        <div className="flex justify-between items-center">
          <h5 className="text-xl font-bold">Today's Sales</h5>
          <FaCalendarDay className="text-green-600" size={24} />
        </div>
        <p className="text-3xl font-bold text-green-600">$5,234</p>
      </Card>
    </div>
  );
}

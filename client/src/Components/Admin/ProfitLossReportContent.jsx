import { Card, ToggleSwitch } from "flowbite-react";
import { FaChartLine, FaMoneyBillWave } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ProfitLossReportContent() {
  const [revenue, setRevenue] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [profitGrowth, setProfitGrowth] = useState(0);
  const [showGrowth, setShowGrowth] = useState(true); // State for toggling growth percentage visibility

  useEffect(() => {
    fetch(`http://localhost:4000/api/finance/revenue?monthOffset=0`)
      .then(response => response.json())
      .then(data => {
        setRevenue(data.revenue || 0);
      });

    fetch(`http://localhost:4000/api/finance/net-profit?monthOffset=0`)
      .then(response => response.json())
      .then(data => {
        setNetProfit(data.netProfit || 0);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/api/finance/revenue?monthOffset=-1")
      .then(response => response.json())
      .then(prevData => {
        const prevRevenue = prevData.revenue || 0;
        setRevenueGrowth(prevRevenue !== 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0);
      });

    fetch("http://localhost:4000/api/finance/net-profit?monthOffset=-1")
      .then(response => response.json())
      .then(prevData => {
        const prevProfit = prevData.netProfit || 0;
        setProfitGrowth(prevProfit !== 0 ? ((netProfit - prevProfit) / prevProfit) * 100 : 0);
      });

    setExpenses(revenue - netProfit);
  }, [revenue, netProfit]);

  return (
    <div className="overflow-auto p-5">
      <h1 className="text-2xl font-bold mb-5">Profit & Loss Report</h1>
      
      {/* Toggle switch to show/hide growth percentages */}
      <ToggleSwitch
        label="Show Growth Percentage"
        checked={showGrowth}
        onChange={() => setShowGrowth(!showGrowth)}
        className="mt-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Total Revenue</h5>
            <FaChartLine className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">Tk {revenue.toLocaleString()}</p>
          {showGrowth && (
            <p className="text-sm text-gray-600">{revenueGrowth.toFixed(1)}% from last month</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Total Expenses</h5>
            <FaMoneyBillWave className="text-red-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-red-600">Tk {expenses.toLocaleString()}</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Net Profit</h5>
            <FaChartLine className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">Tk {netProfit.toLocaleString()}</p>
          {showGrowth && (
            <p className="text-sm text-gray-600">{profitGrowth.toFixed(1)}% from last month</p>
          )}
        </Card>
      </div>
    </div>
  );
}

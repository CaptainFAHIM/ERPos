import { Card } from "flowbite-react"
import {
  FaShoppingCart,
  FaBoxOpen,
  FaWarehouse,
  FaExclamationTriangle,
  FaChartLine,
  FaMoneyBillWave,
} from "react-icons/fa"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function DashboardContent() {
  const salesData = [
    { month: "Jan", sales: 4000, profit: 2400 },
    { month: "Feb", sales: 3000, profit: 1398 },
    { month: "Mar", sales: 2000, profit: 9800 },
    { month: "Apr", sales: 2780, profit: 3908 },
    { month: "May", sales: 1890, profit: 4800 },
    { month: "Jun", sales: 2390, profit: 3800 },
  ]

  const categoryData = [
    { name: "Electronics", value: 400 },
    { name: "Clothing", value: 300 },
    { name: "Food", value: 300 },
    { name: "Books", value: 200 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center mb-5">DASHBOARD</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <FaShoppingCart size={40} />
              <h2 className="text-lg">Daily Sales</h2>
              <p className="text-sm">Total daily sales recorded</p>
            </div>
            <span className="text-2xl font-bold">$1,234.00</span>
          </div>
        </Card>

        <Card className="bg-yellow-500 text-white">
          <div className="flex justify-between items-center">
            <div>
              <FaBoxOpen size={40} />
              <h2 className="text-lg">Total Products</h2>
              <p className="text-sm">Products in inventory</p>
            </div>
            <span className="text-2xl font-bold">324</span>
          </div>
        </Card>

        <Card className="bg-teal-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <FaWarehouse size={40} />
              <h2 className="text-lg">Stock Value</h2>
              <p className="text-sm">Total inventory value</p>
            </div>
            <span className="text-2xl font-bold">$45,678</span>
          </div>
        </Card>

        <Card className="bg-red-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <FaExclamationTriangle size={40} />
              <h2 className="text-lg">Low Stock</h2>
              <p className="text-sm">Items needing restock</p>
            </div>
            <span className="text-2xl font-bold">12</span>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h5 className="text-xl font-bold mb-4">Sales & Profit Trends</h5>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
              <Area type="monotone" dataKey="profit" stroke="#059669" fill="#059669" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h5 className="text-xl font-bold mb-4">Category Distribution</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#0891b2"
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Monthly Revenue</h5>
            <FaChartLine className="text-green-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-green-600">$24,567</p>
          <p className="text-sm text-gray-600">+12.5% from last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Expenses</h5>
            <FaMoneyBillWave className="text-red-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-red-600">$12,345</p>
          <p className="text-sm text-gray-600">-3.2% from last month</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold">Net Profit</h5>
            <FaChartLine className="text-blue-600" size={24} />
          </div>
          <p className="text-3xl font-bold text-blue-600">$12,222</p>
          <p className="text-sm text-gray-600">+15.8% from last month</p>
        </Card>
      </div>
    </div>
  )
}


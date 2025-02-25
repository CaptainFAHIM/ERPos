"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { Sparklines, SparklinesLine } from "react-sparklines"
import { Button, Card, Spinner, Toast } from "flowbite-react"
import {
  FiDollarSign,
  FiTrendingUp,
  FiPieChart,
  FiActivity,
  FiAlertCircle,
  FiArrowUpRight,
  FiArrowDownRight,
  FiRefreshCw,
  FiBarChart2,
  FiTarget,
  FiTrendingDown,
} from "react-icons/fi"
import { HiX } from "react-icons/hi"

export default function ProfitLossReportContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revenue, setRevenue] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [revenueGrowth, setRevenueGrowth] = useState(0)
  const [profitGrowth, setProfitGrowth] = useState(0)
  const [showGrowth, setShowGrowth] = useState(true)
  const [sparklineData] = useState(() => Array.from({ length: 10 }, () => Math.random() * 100))
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState(null)

  const toastTimeout = useRef(null)

  // Financial insights data
  const [insights] = useState([
    {
      title: "Revenue Breakdown",
      value: "Monthly Growth",
      icon: FiBarChart2,
      color: "bg-emerald-100",
      textColor: "text-emerald-600",
      trend: "up",
      percentage: 12.5,
    },
    {
      title: "Target Achievement",
      value: "On Track",
      icon: FiTarget,
      color: "bg-blue-100",
      textColor: "text-blue-600",
      trend: "up",
      percentage: 85,
    },
    {
      title: "Cost Optimization",
      value: "Needs Attention",
      icon: FiTrendingDown,
      color: "bg-amber-100",
      textColor: "text-amber-600",
      trend: "down",
      percentage: -5.2,
    },
  ])

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type })

    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current)
    }

    toastTimeout.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulated API calls
      const [revenueRes, profitRes] = await Promise.all([
        fetch("http://localhost:4000/api/summary-report/monthly-revenue"),
        fetch("http://localhost:4000/api/summary-report/net-profit"),
      ])

      if (!revenueRes.ok || !profitRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const revenueData = await revenueRes.json()
      const profitData = await profitRes.json()

      setRevenue(revenueData.currentMonthRevenue || 0)
      setNetProfit(profitData.netProfit || 0)

      // Previous month data
      const [prevRevenueRes, prevProfitRes] = await Promise.all([
        fetch("http://localhost:4000/api/summary-report/monthly-revenue?monthOffset=-1"),
        fetch("http://localhost:4000/api/summary-report/net-profit?monthOffset=-1"),
      ])

      if (!prevRevenueRes.ok || !prevProfitRes.ok) {
        throw new Error("Failed to fetch previous month's data")
      }

      const prevRevenueData = await prevRevenueRes.json()
      const prevProfitData = await prevProfitRes.json()

      const prevRevenue = prevRevenueData.currentMonthRevenue || 0
      const prevProfit = prevProfitData.netProfit || 0

      setRevenueGrowth(prevRevenue !== 0 ? ((revenueData.currentMonthRevenue - prevRevenue) / prevRevenue) * 100 : 0)
      setProfitGrowth(prevProfit !== 0 ? ((profitData.netProfit - prevProfit) / prevProfit) * 100 : 0)
      showToast("Financial data updated successfully")
    } catch (err) {
      setError("Failed to fetch financial data")
      showToast("Failed to fetch financial data", "error")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    setExpenses(revenue - netProfit)
  }, [revenue, netProfit])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-500">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 opacity-20 rounded-xl blur-lg"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <FiActivity className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Report</h1>
                <p className="text-sm text-gray-500">Real-time profit and loss analysis</p>
              </div>
            </div>
            <Button
              onClick={fetchData}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FiRefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-xl">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">৳{revenue.toLocaleString("en-IN")}</h3>
                  {revenueGrowth !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          revenueGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {revenueGrowth >= 0 ? (
                          <FiArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <FiArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(revenueGrowth).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-24 h-12">
                  <Sparklines data={sparklineData} margin={5}>
                    <SparklinesLine color="#10b981" />
                  </Sparklines>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-100 rounded-xl">
                  <FiTrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                  <h3 className="text-2xl font-bold text-gray-900">৳{expenses.toLocaleString("en-IN")}</h3>
                  <p className="text-sm text-gray-500 mt-1">{((expenses / revenue) * 100).toFixed(1)}% of revenue</p>
                </div>
                <div className="w-24 h-12">
                  <Sparklines data={sparklineData.reverse()} margin={5}>
                    <SparklinesLine color="#ef4444" />
                  </Sparklines>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <FiPieChart className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Net Profit</p>
                  <h3 className="text-2xl font-bold text-gray-900">৳{netProfit.toLocaleString("en-IN")}</h3>
                  {profitGrowth !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          profitGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {profitGrowth >= 0 ? (
                          <FiArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <FiArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(profitGrowth).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-24 h-12">
                  <Sparklines data={sparklineData} margin={5}>
                    <SparklinesLine color="#3b82f6" />
                  </Sparklines>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Financial Overhttp://localhost:4000http://localhost:4000/api Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue vs Target</p>
                  <p className="text-lg font-semibold text-gray-900">85% Achieved</p>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    className="h-full bg-blue-500"
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-500">Expense Budget</p>
                  <p className="text-lg font-semibold text-gray-900">65% Utilized</p>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    className="h-full bg-emerald-500"
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-500">Profit Margin</p>
                  <p className="text-lg font-semibold text-gray-900">32% Growth</p>
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "32%" }}
                    className="h-full bg-indigo-500"
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`p-3 ${insight.color} rounded-lg`}>
                    <insight.icon className={`w-5 h-5 ${insight.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{insight.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{insight.value}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      insight.trend === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {insight.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Toast Notifications */}
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast>
              <div className="flex items-center gap-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${toast.type === "error" ? "bg-red-100 text-red-600" : ""}
                  ${toast.type === "success" ? "bg-green-100 text-green-600" : ""}
                  ${toast.type === "warning" ? "bg-yellow-100 text-yellow-600" : ""}
                `}
                >
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-gray-900">{toast.message}</div>
                <button
                  onClick={() => setToast({ show: false, message: "", type: "" })}
                  className="ml-auto text-gray-400 hover:text-gray-500"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            </Toast>
          </div>
        )}
      </div>
    </div>
  )
}


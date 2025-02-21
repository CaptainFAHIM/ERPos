"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, ToggleSwitch, Spinner } from "flowbite-react"
import { FaChartLine, FaMoneyBillWave, FaArrowUp, FaArrowDown, FaBalanceScale } from "react-icons/fa"

export default function ProfitLossReportContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [revenue, setRevenue] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [revenueGrowth, setRevenueGrowth] = useState(0)
  const [profitGrowth, setProfitGrowth] = useState(0)
  const [showGrowth, setShowGrowth] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch current month's data
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

      // Fetch previous month's data for growth calculation
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
    } catch (err) {
      setError("Failed to fetch financial data. Please try again later.")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate expenses whenever revenue or net profit changes
  useEffect(() => {
    setExpenses(revenue - netProfit)
  }, [revenue, netProfit])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <FaBalanceScale className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profit & Loss Report</h1>
            <p className="text-sm text-gray-600">Financial performance overview</p>
          </div>
        </div>
        <ToggleSwitch label="Show Growth" checked={showGrowth} onChange={setShowGrowth} className="mt-4 sm:mt-0" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaChartLine className="text-2xl text-green-600" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm text-gray-600">Total Revenue</h5>
              <p className="text-2xl font-bold text-gray-800">
                ৳{revenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              {showGrowth && (
                <div
                  className={`flex items-center gap-1 text-sm ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {revenueGrowth >= 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                  {Math.abs(revenueGrowth).toFixed(1)}% from last month
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaMoneyBillWave className="text-2xl text-red-600" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm text-gray-600">Total Expenses</h5>
              <p className="text-2xl font-bold text-gray-800">
                ৳{expenses.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              <div className="text-sm text-gray-500">{((expenses / revenue) * 100).toFixed(1)}% of revenue</div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaChartLine className="text-2xl text-blue-600" />
            </div>
            <div className="flex-1">
              <h5 className="text-sm text-gray-600">Net Profit</h5>
              <p className="text-2xl font-bold text-gray-800">
                ৳{netProfit.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
              {showGrowth && (
                <div
                  className={`flex items-center gap-1 text-sm ${profitGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {profitGrowth >= 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                  {Math.abs(profitGrowth).toFixed(1)}% from last month
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Key Financial Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Profit Margin</p>
            <p className="text-2xl font-bold text-gray-800">{((netProfit / revenue) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Expense Ratio</p>
            <p className="text-2xl font-bold text-gray-800">{((expenses / revenue) * 100).toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Growth Rate</p>
            <p className="text-2xl font-bold text-gray-800">{revenueGrowth.toFixed(1)}%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}


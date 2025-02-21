"use client"

import { useState, useEffect } from "react"
import { FaChartLine, FaChartPie, FaChartBar } from "react-icons/fa"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { motion } from "framer-motion"

import FinancialSummary from "./financial-summary"
import SummaryCards from "./summary-cards"

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function PremiumDashboard() {
  const [salesProfitData, setSalesProfitData] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("currentMonth")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [salesProfitResponse, categoriesResponse] = await Promise.all([
          fetch("http://localhost:4000/api/sales-profit"),
          fetch("http://localhost:4000/api/categories"),
        ])

        if (!salesProfitResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const salesProfitData = await salesProfitResponse.json()
        const categories = await categoriesResponse.json()

        setSalesProfitData(salesProfitData)

        const categoryWithProductCounts = await Promise.all(
          categories.map(async (category) => {
            const categoryResponse = await fetch(`http://localhost:4000/api/productscategory/${category.categoryName}`)
            if (!categoryResponse.ok) throw new Error("Failed to fetch product count for category")
            const productData = await categoryResponse.json()
            return {
              name: category.categoryName,
              value: productData.productCount,
            }
          }),
        )

        setCategoryData(categoryWithProductCounts)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatChartData = (data, period) => {
    if (!data || !data[period]) return []
    return [
      {
        name: period,
        sales: data[period].totalSales,
        profit: data[period].totalProfit,
      },
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold  text-gray-700 mb-8"
      >
        Dashboard
      </motion.h1>

      <SummaryCards setError={setError} />

      <div className="mt-8 flex flex-col lg:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 flex-1"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-500" /> Sales & Profit Trends
          </h2>
          <select
            className="mb-4 p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="currentMonth">Current Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
            <option value="last1Year">Last Year</option>
            <option value="last3Years">Last 3 Years</option>
            <option value="allTime">All Time</option>
          </select>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 flex items-center justify-center h-64">{error}</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formatChartData(salesProfitData, selectedPeriod)}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="#93C5FD" />
                  <Area type="monotone" dataKey="profit" stroke="#10B981" fill="#6EE7B7" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 flex-1"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <FaChartPie className="mr-2 text-green-500" /> Category Distribution
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 flex items-center justify-center h-64">{error}</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 bg-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaChartBar className="mr-2 text-purple-500" /> Category Comparison
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 flex items-center justify-center h-64">{error}</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      <FinancialSummary setError={setError} />
    </div>
  )
}


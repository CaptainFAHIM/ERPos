"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { FaChartLine, FaChartPie, FaChartBar, FaSpinner } from "react-icons/fa"
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
import { motion, AnimatePresence } from "framer-motion"
import SummaryCards from "./summary-cards"
import FinancialSummary from "./financial-summary"

// Enhanced loading spinner component
const LoadingSpinner = ({ color = "blue" }) => (
  <div className="flex justify-center items-center h-64">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center gap-4`}
    >
      <FaSpinner className={`animate-spin h-12 w-12 text-${color}-500`} />
      <span className={`text-${color}-500 font-medium`}>Loading data...</span>
    </motion.div>
  </div>
)

// Enhanced error component
const ErrorDisplay = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-64 text-red-500 gap-4"
  >
    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <p className="text-lg font-medium">{message}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Try Again
    </button>
  </motion.div>
)

// Enhanced tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm p-4 border border-gray-200 rounded-xl shadow-lg"
      >
        <p className="font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm" style={{ color: entry.color }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">
              {entry.name}: {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </motion.div>
    )
  }
  return null
}

// Chart color palette
const COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#F59E0B", // Amber
  "#10B981", // Emerald
]

// Time period options
const TIME_PERIODS = [
  { value: "currentMonth", label: "Current Month" },
  { value: "last3Months", label: "Last 3 Months" },
  { value: "last6Months", label: "Last 6 Months" },
  { value: "last1Year", label: "Last Year" },
  { value: "last3Years", label: "Last 3 Years" },
  { value: "allTime", label: "All Time" },
]

export default function PremiumDashboard() {
  const [salesProfitData, setSalesProfitData] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState("currentMonth")
  const [hoveredCategory, setHoveredCategory] = useState(null)

  // Memoized data fetching function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [salesProfitResponse, categoriesResponse] = await Promise.all([
        fetch("http://localhost:4000/api/sales-profit"),
        fetch("http://localhost:4000/api/categories"),
      ])

      if (!salesProfitResponse.ok || !categoriesResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const salesProfitData = await salesProfitResponse.json()
      const categories = await categoriesResponse.json()

      // Fetch product counts for each category in parallel
      const categoryWithProductCounts = await Promise.all(
        categories.map(async (category) => {
          const response = await fetch(`http://localhost:4000/api/productscategory/${category.categoryName}`)
          if (!response.ok) throw new Error(`Failed to fetch data for ${category.categoryName}`)
          const { productCount } = await response.json()
          return {
            name: category.categoryName,
            value: productCount,
          }
        }),
      )

      setSalesProfitData(salesProfitData)
      setCategoryData(categoryWithProductCounts)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to fetch dashboard data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoized chart data formatting
  const formattedChartData = useMemo(() => {
    if (!salesProfitData || !salesProfitData[selectedPeriod]) return []
    return [
      {
        name: selectedPeriod,
        sales: salesProfitData[selectedPeriod].totalSales,
        profit: salesProfitData[selectedPeriod].totalProfit,
      },
    ]
  }, [salesProfitData, selectedPeriod])

  // Chart event handlers
  const handlePieEnter = useCallback((_, index) => {
    setHoveredCategory(index)
  }, [])

  const handlePieLeave = useCallback(() => {
    setHoveredCategory(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 mb-8"
        >
          Premium Dashboard
        </motion.h1>

       <div className="mb-10">
       <SummaryCards/> 

       </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales & Profit Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FaChartLine className="text-indigo-500" />
                <span>Sales & Profit</span>
              </h2>
              <select
                className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-gray-800
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-all duration-200"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {TIME_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <LoadingSpinner color="indigo" />
              ) : error ? (
                <ErrorDisplay message={error} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedChartData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#6366F1"
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#8B5CF6"
                        fill="url(#profitGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FaChartPie className="text-violet-500" />
              <span>Category Distribution</span>
            </h2>

            <AnimatePresence mode="wait">
              {loading ? (
                <LoadingSpinner color="violet" />
              ) : error ? (
                <ErrorDisplay message={error} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        onMouseEnter={handlePieEnter}
                        onMouseLeave={handlePieLeave}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={hoveredCategory === null || hoveredCategory === index ? 1 : 0.5}
                            className="transition-opacity duration-200"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Category Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar className="text-rose-500" />
            <span>Category Comparison</span>
          </h2>

          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingSpinner color="rose" />
            ) : error ? (
              <ErrorDisplay message={error} />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity duration-200"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <FinancialSummary/>
    </div>
  )
}


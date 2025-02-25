"use client"

import { useEffect, useState } from "react"
import { FaChartLine, FaMoneyBillWave } from "react-icons/fa"
import { motion } from "framer-motion"

export default function FinancialSummary({ setError }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetching each financial data from separate routes
        const revenueResponse = await fetch("http://localhost:4000/api/summary-report/monthly-revenue")
        const grossProfitResponse = await fetch("http://localhost:4000/api/summary-report/gross-profit")
        const netProfitResponse = await fetch("http://localhost:4000/api/summary-report/net-profit")

        if (!revenueResponse.ok || !grossProfitResponse.ok || !netProfitResponse.ok) {
          throw new Error("Failed to fetch financial data")
        }

        const revenueData = await revenueResponse.json()
        const grossProfitData = await grossProfitResponse.json()
        const netProfitData = await netProfitResponse.json()

        setData({
          revenue: revenueData.currentMonthRevenue,
          grossProfit: grossProfitData.grossProfit,
          netProfit: netProfitData.netProfit,
        })
      } catch (error) {
        console.error("Error fetching financial data:", error)
        setError("Failed to fetch financial data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setError])

  const summaries = [
    { title: "Monthly Revenue", icon: FaChartLine, value: data?.revenue, color: "text-blue-500" },
    { title: "Gross Profit", icon: FaMoneyBillWave, value: data?.grossProfit, color: "text-green-500" },
    { title: "Net Profit", icon: FaChartLine, value: data?.netProfit, color: "text-indigo-500" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {summaries.map((summary, index) => (
        <motion.div
          key={summary.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{summary.title}</h3>
              <summary.icon className={`${summary.color} opacity-75`} size={24} />
            </div>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            ) : (
              <>
                <p className={`text-3xl font-bold ${summary.color}`}>
                  Tk {summary.value ? summary.value.toFixed(2) : "0.00"}
                </p>
                <p className="text-sm text-gray-600 mt-2">This month's {summary.title.toLowerCase()}</p>
              </>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
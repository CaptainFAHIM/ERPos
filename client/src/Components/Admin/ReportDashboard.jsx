"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FaChartBar,
  FaMoneyBillWave,
  FaShoppingCart,
  FaTools,
  FaHandHoldingUsd,
  FaCalendarDay,
  FaArrowDown,
} from "react-icons/fa"

export default function ReportDashboard() {
  const [filter, setFilter] = useState("all")
  const [data, setData] = useState({
    sales: 0,
    expenses: 0,
    damages: 0,
    profit: 0,
    totalHandCash: 0,
    dailyHandCash: 0,
    totalWithdrawn: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [salesRes, expensesRes, damagesRes, profitRes, todayHandCashRes, totalHandCashRes, withdrawalsRes] =
          await Promise.all([
            fetch(`http://localhost:4000/api/report/sales/${filter}`),
            fetch(`http://localhost:4000/api/report/expenses/${filter}`),
            fetch(`http://localhost:4000/api/report/damages/${filter}`),
            fetch(`http://localhost:4000/api/report/profit/${filter}`),
            fetch(`http://localhost:4000/api/handcash/today`),
            fetch(`http://localhost:4000/api/handcash/total`),
            fetch(`http://localhost:4000/api/handcash/withdrawals`),
          ])

        if (
          !salesRes.ok ||
          !expensesRes.ok ||
          !damagesRes.ok ||
          !profitRes.ok ||
          !todayHandCashRes.ok ||
          !totalHandCashRes.ok ||
          !withdrawalsRes.ok
        ) {
          throw new Error("Failed to fetch report data")
        }

        const [sales, expenses, damages, profit, todayHandCash, totalHandCash, withdrawalsData] = await Promise.all([
          salesRes.json(),
          expensesRes.json(),
          damagesRes.json(),
          profitRes.json(),
          todayHandCashRes.json(),
          totalHandCashRes.json(),
          withdrawalsRes.json(),
        ])

        // Calculate total withdrawals from the withdrawals data
        const totalWithdrawn = withdrawalsData.totalWithdrawals || 0

        setData({
          sales: sales.totalSales,
          expenses: expenses.totalExpenses,
          damages: damages.totalDamages,
          profit: profit.profit,
          totalHandCash: totalHandCash.totalHandCash || 0,
          dailyHandCash: todayHandCash.todayHandCash?.closingBalance || 0,
          totalWithdrawn: totalWithdrawn,
        })
      } catch (error) {
        console.error("Error fetching report data:", error)
        setError("Failed to fetch report data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filter])

  const cards = [
    {
      title: "Total Sales",
      value: data.sales,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaChartBar,
      color: "blue",
      subtitle: "Overall sales revenue",
    },
    {
      title: "Total Expenses",
      value: data.expenses,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaMoneyBillWave,
      color: "red",
      subtitle: "Total business expenses",
    },
    {
      title: "Total Damages",
      value: data.damages,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaShoppingCart,
      color: "yellow",
      subtitle: "Value of damaged goods",
    },
    {
      title: "Total Profit",
      value: data.profit,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaTools,
      color: "purple",
      subtitle: "Net business profit",
    },
    {
      title: "Total Hand Cash",
      value: data.totalHandCash,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaHandHoldingUsd,
      color: "green",
      subtitle: "Total available cash",
    },
    {
      title: "Daily Hand Cash",
      value: data.dailyHandCash,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaCalendarDay,
      color: "emerald",
      subtitle: "Today's available cash",
    },
    {
      title: "Total Withdrawn",
      value: data.totalWithdrawn,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaArrowDown,
      color: "orange",
      subtitle: "Total cash withdrawn",
    },
  ]

  if (error) {
    return <div className="text-red-600 p-4 rounded-lg bg-red-50">{error}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Financial Report</h1>
        <div className="flex flex-wrap gap-2">
          {["all", "today", "weekly", "monthly"].map((type) => (
            <motion.button
              key={type}
              onClick={() => setFilter(type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  filter === type
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`
              relative overflow-hidden
              bg-white rounded-2xl shadow-lg
              p-6 hover:shadow-xl
              transition-all duration-300
              border border-gray-100
              group
            `}
          >
            {/* Background gradient */}
            <div
              className={`
                absolute inset-0 opacity-5 group-hover:opacity-10
                transition-opacity duration-300
                bg-gradient-to-br
                ${card.color === "blue" && "from-blue-500 to-blue-600"}
                ${card.color === "red" && "from-red-500 to-red-600"}
                ${card.color === "yellow" && "from-yellow-500 to-yellow-600"}
                ${card.color === "purple" && "from-purple-500 to-purple-600"}
                ${card.color === "green" && "from-green-500 to-green-600"}
                ${card.color === "emerald" && "from-emerald-500 to-emerald-600"}
                ${card.color === "orange" && "from-orange-500 to-orange-600"}
              `}
            />

            {/* Icon */}
            <div
              className={`
                mb-4 inline-flex items-center justify-center
                w-12 h-12 rounded-xl
                ${card.color === "blue" && "bg-blue-100 text-blue-600"}
                ${card.color === "red" && "bg-red-100 text-red-600"}
                ${card.color === "yellow" && "bg-yellow-100 text-yellow-600"}
                ${card.color === "purple" && "bg-purple-100 text-purple-600"}
                ${card.color === "green" && "bg-green-100 text-green-600"}
                ${card.color === "emerald" && "bg-emerald-100 text-emerald-600"}
                ${card.color === "orange" && "bg-orange-100 text-orange-600"}
                group-hover:scale-110 transition-transform duration-300
              `}
            >
              <card.icon className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {card.format ? card.format(card.value) : card.value || 0}
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            </div>

            {/* Hover effect line */}
            <div
              className={`
                absolute bottom-0 left-0 right-0 h-1
                transform scale-x-0 group-hover:scale-x-100
                transition-transform duration-300 origin-left
                ${card.color === "blue" && "bg-blue-500"}
                ${card.color === "red" && "bg-red-500"}
                ${card.color === "yellow" && "bg-yellow-500"}
                ${card.color === "purple" && "bg-purple-500"}
                ${card.color === "green" && "bg-green-500"}
                ${card.color === "emerald" && "bg-emerald-500"}
                ${card.color === "orange" && "bg-orange-500"}
              `}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}


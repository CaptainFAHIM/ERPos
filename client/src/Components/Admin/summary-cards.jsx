"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { FaShoppingCart, FaBoxOpen, FaWarehouse, FaExclamationTriangle } from "react-icons/fa"

export default function SummaryCards() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [salesResponse, productsResponse, stockValueResponse, lowStockResponse] = await Promise.all([
          fetch("http://localhost:4000/api/sales/"),
          fetch("http://localhost:4000/api/productlist/"),
          fetch("http://localhost:4000/api/summary-report/total-stock-value"),
          fetch("http://localhost:4000/api/lowstock/low-stock"),
        ])

        if (!salesResponse.ok || !productsResponse.ok || !stockValueResponse.ok || !lowStockResponse.ok) {
          throw new Error("Failed to fetch summary data")
        }

        const [salesData, productsData, stockValueData, lowStockData] = await Promise.all([
          salesResponse.json(),
          productsResponse.json(),
          stockValueResponse.json(),
          lowStockResponse.json(),
        ])

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0]

        // Filter today's sales and sum up finalAmount
        const dailySales = salesData
          .filter((sale) => new Date(sale.createdAt).toISOString().split("T")[0] === today)
          .reduce((total, sale) => total + (Number(sale.finalAmount) || 0), 0)

        setData({
          dailySales,
          totalProducts: productsData.length,
          stockValue: stockValueData.totalStockValue,
          lowStockCount: lowStockData.lowStockCount,
        })
      } catch (error) {
        console.error("Error fetching summary data:", error)
        setError("Failed to fetch summary data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const cards = [
    {
      title: "Daily Sales",
      value: data?.dailySales,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaShoppingCart,
      color: "blue",
      subtitle: "Total daily sales recorded",
    },
    {
      title: "Total Products",
      value: data?.totalProducts,
      icon: FaBoxOpen,
      color: "green",
      subtitle: "Products in inventory",
    },
    {
      title: "Stock Value",
      value: data?.stockValue,
      format: (v) => `Tk ${v?.toFixed(2)}`,
      icon: FaWarehouse,
      color: "purple",
      subtitle: "Total inventory value",
    },
    {
      title: "Low Stock",
      value: data?.lowStockCount,
      icon: FaExclamationTriangle,
      color: "pink",
      subtitle: "Items needing restock",
    },
  ]

  if (error) {
    return <div className="text-red-600 p-4 rounded-lg bg-red-50">{error}</div>
  }

  return (
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
              ${card.color === "green" && "from-green-500 to-green-600"}
              ${card.color === "purple" && "from-purple-500 to-purple-600"}
              ${card.color === "pink" && "from-pink-500 to-pink-600"}
            `}
          />

          {/* Icon */}
          <div
            className={`
              mb-4 inline-flex items-center justify-center
              w-12 h-12 rounded-xl
              ${card.color === "blue" && "bg-blue-100 text-blue-600"}
              ${card.color === "green" && "bg-green-100 text-green-600"}
              ${card.color === "purple" && "bg-purple-100 text-purple-600"}
              ${card.color === "pink" && "bg-pink-100 text-pink-600"}
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
              ${card.color === "green" && "bg-green-500"}
              ${card.color === "purple" && "bg-purple-500"}
              ${card.color === "pink" && "bg-pink-500"}
            `}
          />
        </motion.div>
      ))}
    </div>
  )
}


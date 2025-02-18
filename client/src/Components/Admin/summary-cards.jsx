"use client"

import { useEffect, useState } from "react"
import { FaShoppingCart, FaBoxOpen, FaWarehouse, FaExclamationTriangle } from "react-icons/fa"

export default function SummaryCards({ setError }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [salesResponse, productsResponse, stockValueResponse, lowStockResponse] = await Promise.all([
          fetch("http://localhost:4000/api/sales/"),
          fetch("http://localhost:4000/api/productlist/"),
          fetch("http://localhost:4000/api/stock-value/"),
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
        const today = new Date().toISOString().split("T")[0];

        // Filter today's sales and sum up finalAmount
        const dailySales = salesData
          .filter(sale => new Date(sale.createdAt).toISOString().split("T")[0] === today)
          .reduce((total, sale) => total + (Number(sale.finalAmount) || 0), 0);

        setData({
          dailySales, // Store daily sales
          totalProducts: productsData.length,
          stockValue: stockValueData.stockValue,
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
  }, [setError])

  const cards = [
    { title: "Daily Sales", icon: FaShoppingCart, value: data?.dailySales, format: (v) => `Tk ${v?.toFixed(2)}`, bgColor: "bg-green-600" },
    { title: "Total Products", icon: FaBoxOpen, value: data?.totalProducts, bgColor: "bg-yellow-500" },
    { title: "Stock Value", icon: FaWarehouse, value: data?.stockValue, format: (v) => `Tk ${v?.toFixed(2)}`, bgColor: "bg-teal-600" },
    { title: "Low Stock", icon: FaExclamationTriangle, value: data?.lowStockCount, bgColor: "bg-red-600" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className={`${card.bgColor} text-white rounded-lg shadow-md p-4 flex justify-between items-center`}>
          <div>
            <card.icon size={40} />
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="text-sm">{getSubtitle(card.title)}</p>
          </div>
          {loading ? (
            <div className="animate-pulse bg-gray-300 h-8 w-24 rounded"></div>
          ) : (
            <span className="text-xl font-bold">{card.format ? card.format(card.value) : card.value || 0}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function getSubtitle(title) {
  switch (title) {
    case "Daily Sales":
      return "Total daily sales recorded"
    case "Total Products":
      return "Products in inventory"
    case "Stock Value":
      return "Total inventory value"
    case "Low Stock":
      return "Items needing restock"
    default:
      return ""
  }
}

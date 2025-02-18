"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Line } from "react-chartjs-2"
import { Card, Datepicker } from "flowbite-react"
import { FaChartLine, FaBoxOpen, FaExclamationCircle, FaTasks, FaChartBar } from "react-icons/fa"
import moment from "moment"
import "chart.js/auto"

const SummaryReport = () => {
  const [summaryData, setSummaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState([moment().subtract(7, "days").toDate(), new Date()])

  useEffect(() => {
    fetchSummaryData()
  }, []) // Updated useEffect dependency array

  const fetchSummaryData = async () => {
    setLoading(true)
    try {
      const [startDate, endDate] = dateRange
      const response = await axios.get(
        `http://localhost:4000/api/summary-report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      )
      setSummaryData(response.data.summaryReport)
    } catch (err) {
      setError("Error fetching summary report")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center text-xl">Loading...</div>
  if (error) return <div className="text-center text-xl text-red-500">{error}</div>

  const data = {
    labels: ["Total Sales", "Total Expenses", "Net Profit", "Monthly Revenue"],
    datasets: [
      {
        label: "Amount in Taka (Tk)",
        data: [
          summaryData.totalSalesAmount,
          summaryData.totalExpenseAmount,
          summaryData.netProfit,
          summaryData.monthlyRevenue,
        ],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Performance Overview",
        font: {
          size: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString() + " Tk",
        },
      },
    },
  }

  const formatValue = (value, key) => {
    if (key === "totalTransactions") {
      return value.toLocaleString()
    }
    if (typeof value === "number") {
      return value.toLocaleString() + " Tk"
    }
    return value
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">Business Summary Report</h1>
        <div className="flex justify-center">
          <Datepicker
            className="z-50"
            onSelectedDatesChange={setDateRange}
            show={true}
            title="Select Date Range"
            defaultDate={dateRange[0]}
            minDate={moment().subtract(1, "year").toDate()}
            maxDate={new Date()}
            rangeSelected={dateRange}
            isRange={true}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          {
            title: "Total Sales",
            value: summaryData.totalSalesAmount,
            color: "bg-blue-500",
            icon: <FaChartLine className="text-5xl text-white" />,
          },
          {
            title: "Total Expenses",
            value: summaryData.totalExpenseAmount,
            color: "bg-red-500",
            icon: <FaExclamationCircle className="text-5xl text-white" />,
          },
          {
            title: "Stock Value",
            value: summaryData.totalStockValue,
            color: "bg-green-500",
            icon: <FaBoxOpen className="text-5xl text-white" />,
          },
          {
            title: "Damaged Value",
            value: summaryData.totalDamageValue,
            color: "bg-yellow-500",
            icon: <FaExclamationCircle className="text-5xl text-white" />,
          },
          {
            title: "Total Transactions",
            value: summaryData.totalTransactions,
            color: "bg-teal-500",
            icon: <FaTasks className="text-5xl text-white" />,
          },
          {
            title: "Net Profit",
            value: summaryData.netProfit,
            color: "bg-purple-500",
            icon: <FaChartBar className="text-5xl text-white" />,
          },
        ].map((item, index) => (
          <Card key={index} className={`${item.color} text-white p-6 shadow-lg rounded-lg`}>
            <div className="flex items-center">
              {item.icon}
              <div className="ml-4">
                <div className="text-xl font-semibold">{item.title}</div>
                <div className="text-2xl font-bold">
                  {item.title === "Total Transactions"
                    ? item.value.toLocaleString()
                    : item.value.toLocaleString() + " Tk"}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg mb-12 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-indigo-600 text-white">
            <tr>
              <th scope="col" className="py-3 px-6">
                Metric
              </th>
              <th scope="col" className="py-3 px-6">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summaryData).map(([key, value], index) => (
              <tr key={key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </th>
                <td className="py-4 px-6 font-semibold">{formatValue(value, key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Performance Graph */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

export default SummaryReport


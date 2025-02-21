"use client"

import { useEffect, useState } from "react"
import { Card, Table, Button, Datepicker, Spinner } from "flowbite-react"
import {
  FaChartLine,
  FaMoneyBillWave,
  FaShoppingCart,
  FaWarehouse,
  FaExclamationTriangle,
  FaExchangeAlt,
  FaFileInvoiceDollar,
  FaHandHoldingUsd,
  FaChartBar,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaPrint,
} from "react-icons/fa"

const SummaryReport = () => {
  const [reportData, setReportData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [businessTips, setBusinessTips] = useState([])
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  const [endDate, setEndDate] = useState(new Date())

  const fetchSummaryData = async () => {
    setLoading(true)
    try {
      const responses = await Promise.all([
        fetch(
          `http://localhost:4000/api/summary-report/total-sales?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/total-revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/total-expenses?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(`http://localhost:4000/api/summary-report/total-stock-value`).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/total-damage-value?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/total-transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/cogs?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/gross-profit?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(
          `http://localhost:4000/api/summary-report/net-profit?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        ).then((res) => res.json()),
        fetch(`http://localhost:4000/api/summary-report/monthly-revenue`).then((res) => res.json()),
      ])

      const data = {
        totalSales: responses[0].totalSalesAmount,
        totalRevenue: responses[1].totalRevenue,
        totalExpenses: responses[2].totalExpenseAmount,
        totalStockValue: responses[3].totalStockValue,
        totalDamageValue: responses[4].totalDamageValue,
        totalTransactions: responses[5].totalTransactions,
        cogs: responses[6].totalCOGS,
        grossProfit: responses[7].grossProfit,
        netProfit: responses[8].netProfit,
        monthlyRevenue: responses[9],
      }

      setReportData(data)
      generateBusinessTips(data)
    } catch (error) {
      setError("Error fetching summary data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummaryData()
  }, [])

  const generateBusinessTips = (data) => {
    const tips = []
    if (data.netProfit < 0) tips.push("Net profit is negative. Consider reducing expenses or increasing sales.")
    if (data.totalDamageValue > 0) tips.push("High damage value detected. Review inventory handling procedures.")
    if (data.totalRevenue < data.totalExpenses)
      tips.push("Revenue is lower than expenses. Look into cost-cutting strategies.")
    if (data.grossProfit < data.cogs)
      tips.push("Cost of Goods Sold is too high. Consider renegotiating supplier costs.")
    setBusinessTips(tips)
  }

  const handlePrint = () => {
    const printContent = document.getElementById("printableFinancialOverview").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const getIcon = (key) => {
    switch (key) {
      case "totalSales":
        return <FaShoppingCart className="text-blue-600 text-3xl" />
      case "totalRevenue":
        return <FaMoneyBillWave className="text-green-600 text-3xl" />
      case "totalExpenses":
        return <FaFileInvoiceDollar className="text-red-600 text-3xl" />
      case "totalStockValue":
        return <FaWarehouse className="text-indigo-600 text-3xl" />
      case "totalDamageValue":
        return <FaExclamationTriangle className="text-yellow-600 text-3xl" />
      case "totalTransactions":
        return <FaExchangeAlt className="text-purple-600 text-3xl" />
      case "cogs":
        return <FaFileInvoiceDollar className="text-orange-600 text-3xl" />
      case "grossProfit":
        return <FaHandHoldingUsd className="text-green-600 text-3xl" />
      case "netProfit":
        return <FaChartBar className="text-blue-600 text-3xl" />
      default:
        return <FaChartLine className="text-gray-600 text-3xl" />
    }
  }

  const getColor = (key, value) => {
    if (key.includes("Profit") || key === "totalRevenue") {
      return value > 0 ? "text-green-600" : "text-red-600"
    }
    return "text-blue-600"
  }

  const formatValue = (key, value) => {
    if (key === "totalTransactions") return value
    return `${value.toLocaleString()} Tk`
  }

  const getAdditionalInfo = (key, value) => {
    switch (key) {
      case "totalSales":
        return `Avg. per transaction: ${(value / reportData.totalTransactions).toFixed(2)} Tk`
      case "totalRevenue":
        return `${((reportData.grossProfit / value) * 100).toFixed(2)}% profit margin`
      case "totalExpenses":
        return `${((value / reportData.totalRevenue) * 100).toFixed(2)}% of revenue`
      case "totalStockValue":
        return `Potential revenue: ${(value * 1.2).toLocaleString()} Tk`
      case "totalDamageValue":
        return `${((value / reportData.totalStockValue) * 100).toFixed(2)}% of stock value`
      case "totalTransactions":
        return `Avg. value: ${(reportData.totalSales / value).toFixed(2)} Tk`
      case "cogs":
        return `${((value / reportData.totalRevenue) * 100).toFixed(2)}% of revenue`
      case "grossProfit":
        return `${((value / reportData.totalRevenue) * 100).toFixed(2)}% of revenue`
      case "netProfit":
        return `${((value / reportData.totalRevenue) * 100).toFixed(2)}% of revenue`
      default:
        return ""
    }
  }

 if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner aria-label="Loading..." size="xl" />
    </div>
  );
  if (error) return <p className="text-center text-red-500">{error}</p>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">Summary Report</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(reportData).map(([key, value]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold capitalize text-gray-700">{key.replace(/([A-Z])/g, " $1")}</h3>
                <p className={`text-2xl font-bold ${getColor(key, value)}`}>
                  {key === "monthlyRevenue" ? (
                    <>
                      {value.currentMonthRevenue.toLocaleString()} Tk
                      <span
                        className={`text-sm ml-2 ${value.growthPercentage > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {value.growthPercentage > 0 ? (
                          <FaArrowUp className="inline" />
                        ) : (
                          <FaArrowDown className="inline" />
                        )}
                        {Math.abs(value.growthPercentage)}%
                      </span>
                    </>
                  ) : (
                    formatValue(key, value)
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">{getAdditionalInfo(key, value)}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">{getIcon(key)}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Financial Overview</h3>
          <div className="flex items-center space-x-4">
            <Datepicker onSelectedDateChanged={setStartDate} />
            <Datepicker onSelectedDateChanged={setEndDate} />
            <Button onClick={fetchSummaryData}>
              <FaCalendarAlt className="mr-2" />
              Update
            </Button>
            <Button onClick={handlePrint} className="ml-2">
              <FaPrint className="mr-2" />
              Print
            </Button>
          </div>
        </div>
        <div id="printableFinancialOverview">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Overview</h3>
          <p>From: {startDate.toLocaleDateString()} To: {endDate.toLocaleDateString()}</p>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Metric</Table.HeadCell>
              <Table.HeadCell>Value</Table.HeadCell>
              <Table.HeadCell>Additional Info</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {Object.entries(reportData).map(([key, value]) => (
                <Table.Row key={key} className="bg-white">
                  <Table.Cell className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </Table.Cell>
                  <Table.Cell className={getColor(key, value)}>
                    {key === "monthlyRevenue" ? (
                      <>
                        {value.currentMonthRevenue.toLocaleString()} Tk
                        <span
                          className={`text-sm ml-2 ${value.growthPercentage > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {value.growthPercentage > 0 ? (
                            <FaArrowUp className="inline" />
                          ) : (
                            <FaArrowDown className="inline" />
                          )}
                          {Math.abs(value.growthPercentage)}%
                        </span>
                      </>
                    ) : (
                      formatValue(key, value)
                    )}
                  </Table.Cell>
                  <Table.Cell>{getAdditionalInfo(key, value)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {businessTips.length > 0 && (
        <Card className="mt-8 bg-yellow-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaLightbulb className="text-yellow-500 text-2xl mr-2" /> Business Tips & Suggestions
          </h3>
          <ul className="list-disc pl-5 text-gray-800 space-y-2">
            {businessTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </Card>
      )}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printableFinancialOverview, #printableFinancialOverview * {
            visibility: visible;
          }
          #printableFinancialOverview {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default SummaryReport

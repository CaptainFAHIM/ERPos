"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, Table, Spinner, Badge, Button, TextInput } from "flowbite-react"
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaPercentage,
  FaStar,
  FaCrown,
  FaChartLine,
  FaCalendarDay,
  FaPrint,
  FaFileExcel,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa"
import * as XLSX from "xlsx"

export default function DailyReportContent() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [filteredSales, setFilteredSales] = useState([])

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/sales/")
        if (!response.ok) throw new Error("Failed to fetch sales data")
        const data = await response.json()
        setSales(data)
        setFilteredSales(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [])

  const handleSearch = useCallback(() => {
    const filtered = sales.filter((sale) => {
      const searchFields = [sale.customerName, sale.invoiceNo, sale.transactionNo, sale.finalAmount?.toString()]

      const matchesSearch =
        searchTerm === "" ||
        searchFields.some((field) => field && field.toLowerCase().includes(searchTerm.toLowerCase()))

      const saleDate = new Date(sale.createdAt)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDateRange = (!start || saleDate >= start) && (!end || saleDate <= end)

      return matchesSearch && matchesDateRange
    })

    setFilteredSales(filtered)
  }, [searchTerm, startDate, endDate, sales])

  useEffect(() => {
    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [handleSearch])

  const { totalSales, totalTransactions, totalDiscounts, trendingProducts, customerSales } = filteredSales.reduce(
    (acc, sale) => {
      acc.totalSales += sale.finalAmount || 0
      acc.totalTransactions++
      acc.totalDiscounts += sale.discount || 0

      sale.products?.forEach((item) => {
        const { _id, barcode, description } = item.productId
        if (!acc.trendingProducts[_id]) {
          acc.trendingProducts[_id] = { barcode, description, quantity: 0, totalSales: 0 }
        }
        acc.trendingProducts[_id].quantity += item.quantity
        acc.trendingProducts[_id].totalSales += item.totalPrice || 0
      })

      if (sale.customerName) {
        if (!acc.customerSales[sale.customerName]) {
          acc.customerSales[sale.customerName] = { totalAmount: 0, transactions: 0 }
        }
        acc.customerSales[sale.customerName].totalAmount += sale.finalAmount || 0
        acc.customerSales[sale.customerName].transactions++
      }

      return acc
    },
    {
      totalSales: 0,
      totalTransactions: 0,
      totalDiscounts: 0,
      trendingProducts: {},
      customerSales: {},
    },
  )

  const topProducts = Object.values(trendingProducts)
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5)

  const bestSellingProduct = topProducts[0] || null

  const bestCustomer = Object.entries(customerSales).sort((a, b) => b[1].totalAmount - a[1].totalAmount)[0] || null

  const handlePrint = useCallback(() => {
    const printContent = document.getElementById("printableContent")?.outerHTML
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Daily Sales Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                padding: 0; 
                color: #1f2937;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-bottom: 2rem;
              }
              th, td { 
                padding: 12px; 
                text-align: left; 
                border: 1px solid #e5e7eb; 
              }
              th { 
                background-color: #f9fafb; 
                font-weight: 600;
              }
              .badge {
                background-color: #e5e7eb;
                padding: 4px 8px;
                border-radius: 9999px;
                font-size: 0.875rem;
              }
              .card {
                border: 1px solid #e5e7eb;
                padding: 1rem;
                margin-bottom: 1rem;
                border-radius: 0.5rem;
              }
              h1, h2 { 
                color: #1f2937;
                margin-bottom: 1rem;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.onafterprint = () => {
        window.location.reload()
      }
    }
  }, [])

  const handleExcelExport = useCallback(() => {
    const exportData = filteredSales.map((sale) => ({
      Date: new Date(sale.createdAt).toLocaleDateString(),
      "Invoice No": sale.invoiceNo || "N/A",
      "Transaction No": sale.transactionNo || "N/A",
      Customer: sale.customerName || "Walk-in",
      Amount: sale.finalAmount || 0,
      "Payment Method": sale.paymentMethod || "N/A",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "DailySales")
    XLSX.writeFile(workbook, `daily_sales_${new Date().toISOString().split("T")[0]}.xlsx`)
  }, [filteredSales])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="xl" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center text-xl p-4">{error}</p>
  }

  return (
    <div className="container mx-auto p-4 space-y-6" id="printableContent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daily Sales Report</h1>
            <p className="text-sm text-gray-600">Overview of daily sales and transactions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button gradientDuoTone="purpleToBlue" onClick={handlePrint}>
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button gradientDuoTone="greenToBlue" onClick={handleExcelExport}>
            <FaFileExcel className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <TextInput
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FaSearch}
            className="w-full"
          />
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <FaCalendarAlt size={14} />
          </div>
          <TextInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <FaCalendarAlt size={14} />
          </div>
          <TextInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaMoneyBillWave className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">
                ৳{totalSales.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaShoppingCart className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaPercentage className="text-2xl text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Discounts</p>
              <p className="text-2xl font-bold text-gray-800">
                ৳{totalDiscounts.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        {bestSellingProduct && (
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-none">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaStar className="text-2xl text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Seller</p>
                <p className="text-2xl font-bold text-gray-800">
                  ৳{bestSellingProduct.totalSales.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 truncate">{bestSellingProduct.description}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Trending Products and Best Customer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-600" /> Trending Products
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell className="bg-gray-50">Product</Table.HeadCell>
                <Table.HeadCell className="bg-gray-50">Barcode</Table.HeadCell>
                <Table.HeadCell className="bg-gray-50">Quantity Sold</Table.HeadCell>
                <Table.HeadCell className="bg-gray-50">Total Sales</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {topProducts.map((product, index) => (
                  <Table.Row key={index} className="bg-white">
                    <Table.Cell className="font-medium">{product.description}</Table.Cell>
                    <Table.Cell>{product.barcode}</Table.Cell>
                    <Table.Cell>
                      <Badge color="info" className="font-medium">
                        {product.quantity}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>৳{product.totalSales.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCrown className="mr-2 text-yellow-500" /> Best Customer
          </h2>
          {bestCustomer ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FaCrown className="text-xl text-yellow-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{bestCustomer[0]}</p>
                  <p className="text-sm text-gray-500">{bestCustomer[1].transactions} transactions</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-800">
                  ৳{bestCustomer[1].totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No customer data available</p>
          )}
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaCalendarDay className="mr-2 text-indigo-600" /> Sales Transactions
        </h2>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="bg-gray-50">Invoice No</Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">Transaction No</Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">Customer</Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">Amount</Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">Payment Method</Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">Date</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredSales.map((sale) => (
                <Table.Row key={sale._id} className="bg-white hover:bg-gray-50 transition-colors">
                  <Table.Cell className="font-medium">{sale.invoiceNo || "N/A"}</Table.Cell>
                  <Table.Cell>{sale.transactionNo || "N/A"}</Table.Cell>
                  <Table.Cell>{sale.customerName || "Walk-in"}</Table.Cell>
                  <Table.Cell className="font-medium text-gray-900">
                    ৳{sale.finalAmount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "0.00"}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={sale.paymentMethod === "cash" ? "success" : "info"}
                      className="font-medium capitalize"
                    >
                      {sale.paymentMethod || "N/A"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="text-gray-600">
                    {sale.createdAt
                      ? new Date(sale.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  )
}


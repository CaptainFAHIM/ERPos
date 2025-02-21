"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Table, Button, TextInput, Spinner, Card } from "flowbite-react"
import {
  FaSearch,
  FaPrint,
  FaFileExcel,
  FaSyncAlt,
  FaUsers,
  FaChartLine,
  FaCheckCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaShoppingCart,
} from "react-icons/fa"
import * as XLSX from "xlsx"

export default function CustomerLedgerContent() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })

  // Calculate summary statistics
  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.finalAmount || 0)
        return {
          totalAmount: acc.totalAmount + amount,
          averageTransaction: acc.totalAmount / filteredTransactions.length,
          transactionCount: acc.transactionCount + 1,
          highestTransaction: Math.max(acc.highestTransaction, amount),
          lowestTransaction: Math.min(acc.lowestTransaction, amount || Number.POSITIVE_INFINITY),
          uniqueCustomers: new Set([...acc.uniqueCustomers, transaction.customerName]),
        }
      },
      {
        totalAmount: 0,
        averageTransaction: 0,
        transactionCount: 0,
        highestTransaction: 0,
        lowestTransaction: Number.POSITIVE_INFINITY,
        uniqueCustomers: new Set(),
      },
    )
  }, [filteredTransactions])

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/api/sales/")
      if (!response.ok) throw new Error("Failed to fetch data")
      const data = await response.json()
      setTransactions(data)
      setFilteredTransactions(data)
    } catch (error) {
      setError("Failed to fetch customer transactions. Please try again later.")
      console.error("Error fetching sales data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleSearch = useCallback(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.finalAmount.toString().includes(searchTerm)

      const transactionDate = new Date(transaction.createdAt)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      const matchesDateRange = (!start || transactionDate >= start) && (!end || transactionDate <= end)

      return matchesSearch && matchesDateRange
    })

    setFilteredTransactions(filtered)
  }, [searchTerm, startDate, endDate, transactions])

  useEffect(() => {
    const debounceTimer = setTimeout(handleSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [handleSearch])

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortConfig.key === "finalAmount") {
        return sortConfig.direction === "asc"
          ? (a.finalAmount || 0) - (b.finalAmount || 0)
          : (b.finalAmount || 0) - (a.finalAmount || 0)
      }
      return 0
    })
  }, [filteredTransactions, sortConfig])

  const handlePrint = useCallback(() => {
    const printContent = document.getElementById("printableTable")?.outerHTML
    const summaryContent = document.getElementById("summaryStats")?.outerHTML

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Customer Ledger</title>
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
              .status { 
                background-color: #10b981; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 4px;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Customer Ledger</h1>
            ${summaryContent}
            ${printContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }, [])

  const handleExcelExport = useCallback(() => {
    const exportData = sortedTransactions.map((t) => ({
      Date: new Date(t.createdAt).toLocaleDateString(),
      Customer: t.customerName,
      Amount: t.finalAmount,
      Status: "Paid",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "CustomerLedger")
    XLSX.writeFile(workbook, `customer_ledger_${new Date().toISOString().split("T")[0]}.xlsx`)
  }, [sortedTransactions])

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button color="failure" onClick={fetchTransactions}>
            <FaSyncAlt className="mr-2" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <FaUsers className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Ledger</h1>
            <p className="text-sm text-gray-600">Track customer transactions and payments</p>
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

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="summaryStats">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaDollarSign className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-800">
                ৳{summary.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaUsers className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-2xl font-bold text-gray-800">{summary.uniqueCustomers.size}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaShoppingCart className="text-2xl text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{summary.transactionCount}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <FaChartLine className="text-2xl text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Sale</p>
              <p className="text-2xl font-bold text-gray-800">
                ৳{summary.averageTransaction.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <TextInput
            type="text"
            placeholder="Search by customer, amount..."
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

      {/* Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Spinner size="xl" />
          <p className="text-gray-500">Loading transactions...</p>
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-200">
          <Table hoverable id="printableTable" className="w-full text-sm text-left text-gray-900">
            <Table.Head>
              <Table.HeadCell className="bg-gray-50 cursor-pointer font-medium" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt size={14} className="text-gray-500" />
                  <span>Date</span>
                  {sortConfig.key === "createdAt" && (
                    <span className="text-gray-500">
                      {sortConfig.direction === "asc" ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                    </span>
                  )}
                </div>
              </Table.HeadCell>
              <Table.HeadCell className="bg-gray-50 font-medium">
                <div className="flex items-center gap-2">
                  <FaUsers size={14} className="text-gray-500" />
                  <span>Customer</span>
                </div>
              </Table.HeadCell>
              <Table.HeadCell
                className="bg-gray-50 cursor-pointer font-medium"
                onClick={() => handleSort("finalAmount")}
              >
                <div className="flex items-center gap-2">
                  <FaDollarSign size={14} className="text-gray-500" />
                  <span>Amount</span>
                  {sortConfig.key === "finalAmount" && (
                    <span className="text-gray-500">
                      {sortConfig.direction === "asc" ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                    </span>
                  )}
                </div>
              </Table.HeadCell>
              <Table.HeadCell className="bg-gray-50 font-medium">
                <div className="flex items-center gap-2">
                  <FaCheckCircle size={14} className="text-gray-500" />
                  <span>Status</span>
                </div>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {sortedTransactions.map((transaction, index) => (
                <Table.Row key={index} className="bg-white hover:bg-gray-50 transition-colors">
                  <Table.Cell className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="font-medium text-gray-900">{transaction.customerName}</span>
                  </Table.Cell>
                  <Table.Cell className="font-medium">
                    ৳{transaction.finalAmount?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium inline-block bg-green-50 text-green-700 border border-green-200">
                      Paid
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  )
}


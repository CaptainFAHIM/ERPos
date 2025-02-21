"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import axios from "axios"
import { Table, Button, TextInput, Spinner, Card } from "flowbite-react"
import {
  FaSearch,
  FaPrint,
  FaFileExcel,
  FaSyncAlt,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaUserTie,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa"
import * as XLSX from "xlsx"

export default function SupplierLedgerContent() {
  const [ledger, setLedger] = useState([])
  const [filteredLedger, setFilteredLedger] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [isFiltering, setIsFiltering] = useState(false)

  // Calculate summary statistics with trends
  const summary = useMemo(() => {
    const stats = filteredLedger.reduce(
      (acc, entry) => {
        const totalPrice = Number(entry.totalPrice || 0)
        const paidAmount = Number(entry.paidAmount || 0)
        const dueAmount = Number(entry.dueAmount || 0)
        const currentDue = Number(entry.supplier?.dueAmount || 0)

        return {
          totalAmount: acc.totalAmount + totalPrice,
          totalPaid: acc.totalPaid + paidAmount,
          totalDue: acc.totalDue + currentDue,
          pendingPayments: acc.pendingPayments + (currentDue > 0 ? 1 : 0),
          highestPayment: Math.max(acc.highestPayment, paidAmount),
          lowestPayment: Math.min(acc.lowestPayment, paidAmount || Number.POSITIVE_INFINITY),
          paymentCount: acc.paymentCount + 1,
        }
      },
      {
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        pendingPayments: 0,
        highestPayment: 0,
        lowestPayment: Number.POSITIVE_INFINITY,
        paymentCount: 0,
      },
    )

    // Calculate average payment
    stats.averagePayment = stats.paymentCount ? stats.totalPaid / stats.paymentCount : 0
    stats.paymentRate = (stats.totalPaid / stats.totalAmount) * 100 || 0

    return stats
  }, [filteredLedger])

  const fetchLedger = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:4000/api/payments/")
      const processedData = response.data.map((entry) => ({
        ...entry,
        totalPrice: Number(entry.totalPrice || 0),
        paidAmount: Number(entry.paidAmount || 0),
        dueAmount: Number(entry.dueAmount || 0),
        currentDue: Number(entry.supplier?.dueAmount || 0),
      }))
      setLedger(processedData)
      setFilteredLedger(processedData)
    } catch (error) {
      setError("Failed to fetch supplier ledger. Please try again later.")
      console.error("Error fetching supplier ledger:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLedger()
  }, [fetchLedger])

  const filterLedger = useCallback(() => {
    setIsFiltering(true)
    try {
      const filtered = ledger.filter((entry) => {
        const searchFields = [
          entry.supplier?.name,
          entry.totalPrice?.toString(),
          entry.paidAmount?.toString(),
          entry.supplier?.dueAmount?.toString(),
        ]

        const matchesSearch =
          searchTerm === "" ||
          searchFields.some((field) => field && field.toLowerCase().includes(searchTerm.toLowerCase()))

        const entryDate = new Date(entry.createdAt)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        if (start) start.setHours(0, 0, 0, 0)
        if (end) end.setHours(23, 59, 59, 999)

        const matchesDateRange = (!start || entryDate >= start) && (!end || entryDate <= end)

        return matchesSearch && matchesDateRange
      })

      setFilteredLedger(filtered)
    } catch (error) {
      console.error("Error filtering ledger:", error)
    } finally {
      setIsFiltering(false)
    }
  }, [searchTerm, ledger, startDate, endDate])

  useEffect(() => {
    const debounceTimer = setTimeout(filterLedger, 300)
    return () => clearTimeout(debounceTimer)
  }, [filterLedger])

  const handlePrint = useCallback(() => {
    const printContent = document.getElementById("printableTable")?.outerHTML
    const summaryContent = document.getElementById("summaryStats")?.outerHTML

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Supplier Ledger</title>
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
              .status-paid { 
                background-color: #10b981; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 4px;
              }
              .status-pending { 
                background-color: #ef4444; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 4px;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
              }
              .summary-card {
                padding: 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.5rem;
                background-color: #f9fafb;
              }
              h1 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 1rem;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Supplier Ledger</h1>
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
    const exportData = filteredLedger.map((entry) => ({
      Date: new Date(entry.createdAt).toLocaleDateString(),
      Supplier: entry.supplier?.name ?? "N/A",
      "Total Price": entry.totalPrice ?? 0,
      "Paid Amount": entry.paidAmount ?? 0,
      "Current Due": entry.supplier?.dueAmount ?? 0,
      Status: entry.supplier?.dueAmount > 0 ? "Pending" : "Paid",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "SupplierLedger")
    XLSX.writeFile(workbook, `supplier_ledger_${new Date().toISOString().split("T")[0]}.xlsx`)
  }, [filteredLedger])

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const sortedLedger = useMemo(() => {
    return [...filteredLedger].sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        return sortConfig.direction === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      }

      const aValue = a[sortConfig.key] || 0
      const bValue = b[sortConfig.key] || 0

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
    })
  }, [filteredLedger, sortConfig])

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button color="failure" onClick={fetchLedger}>
            <FaSyncAlt className="mr-2" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Enhanced Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
        <div className="flex items-center gap-3">
          <FaMoneyBillWave className="text-3xl text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supplier Ledger</h1>
            <p className="text-sm text-gray-600">Manage and track supplier payments</p>
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

      {/* Enhanced Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaDollarSign className="text-2xl text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-2xl font-bold text-gray-800">
                ৳{summary.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <FaArrowUp className="text-green-500" />
                <span className="text-green-600">{summary.paymentRate.toFixed(1)}% paid</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaCheckCircle className="text-2xl text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Paid</span>
              <span className="text-2xl font-bold text-gray-800">
                ৳{summary.totalPaid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-600">
                  Avg: ৳{summary.averagePayment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-2xl text-red-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Total Due</span>
              <span className="text-2xl font-bold text-gray-800">
                ৳{summary.totalDue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <FaClock className="text-orange-500" />
                <span className="text-orange-600">{summary.pendingPayments} pending</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaChartLine className="text-2xl text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-600">Payment Range</span>
              <span className="text-2xl font-bold text-gray-800">
                ৳{summary.highestPayment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <FaArrowDown className="text-purple-500" />
                <span className="text-purple-600">
                  Min: ৳
                  {summary.lowestPayment === Number.POSITIVE_INFINITY
                    ? 0
                    : summary.lowestPayment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <TextInput
            type="text"
            placeholder="Search by supplier, amount..."
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

      {/* Enhanced Table Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Spinner size="xl" />
          <p className="text-gray-500">Loading ledger entries...</p>
        </div>
      ) : (
        <>
          {filteredLedger.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <FaExclamationTriangle className="text-4xl text-gray-400" />
              <p className="text-gray-500 text-lg">No ledger entries found</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <Table striped id="printableTable">
                <Table.Head>
                  <Table.HeadCell className="bg-gray-100 cursor-pointer" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt size={14} />
                      Date
                      {sortConfig.key === "createdAt" &&
                        (sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
                    </div>
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-100">
                    <div className="flex items-center gap-2">
                      <FaUserTie size={14} />
                      Supplier
                    </div>
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-100 cursor-pointer" onClick={() => handleSort("totalPrice")}>
                    <div className="flex items-center gap-2">
                      <FaDollarSign size={14} />
                      Total Price
                      {sortConfig.key === "totalPrice" &&
                        (sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
                    </div>
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-100 cursor-pointer" onClick={() => handleSort("paidAmount")}>
                    <div className="flex items-center gap-2">
                      <FaMoneyBillWave size={14} />
                      Paid Amount
                      {sortConfig.key === "paidAmount" &&
                        (sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
                    </div>
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-100 cursor-pointer" onClick={() => handleSort("currentDue")}>
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle size={14} />
                      Current Due
                      {sortConfig.key === "currentDue" &&
                        (sortConfig.direction === "asc" ? <FaArrowUp /> : <FaArrowDown />)}
                    </div>
                  </Table.HeadCell>
                  <Table.HeadCell className="bg-gray-100">Status</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                  {sortedLedger.map((entry) => (
                    <Table.Row key={entry._id} className="bg-white hover:bg-gray-50 transition-colors">
                      <Table.Cell>
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FaUserTie className="text-gray-400" />
                          {entry.supplier?.name ?? "N/A"}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <FaDollarSign className="text-gray-400" />
                          {entry.totalPrice?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "0.00"}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <FaMoneyBillWave className="text-green-500" />
                          {entry.paidAmount?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "0.00"}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <FaExclamationTriangle className={entry.currentDue > 0 ? "text-red-500" : "text-gray-400"} />
                          {entry.currentDue?.toLocaleString("en-IN", { maximumFractionDigits: 2 }) ?? "0.00"}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                            entry.currentDue > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {entry.currentDue > 0 ? (
                            <>
                              <FaClock />
                              Pending
                            </>
                          ) : (
                            <>
                              <FaCheckCircle />
                              Paid
                            </>
                          )}
                        </span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  )
}


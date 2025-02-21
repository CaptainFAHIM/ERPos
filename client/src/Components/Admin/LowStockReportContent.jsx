"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, Card, Button, TextInput, Badge, Spinner } from "flowbite-react"
import {
  FaCartArrowDown,
  FaSearch,
  FaFileExcel,
  FaPrint,
  FaSyncAlt,
  FaExclamationTriangle,
  FaBox,
  FaBarcode,
  FaWarehouse,
} from "react-icons/fa"
import * as XLSX from "xlsx"

export default function LowStockReportContent() {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [lowStockCount, setLowStockCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: "totalQuantity", direction: "asc" })
  const [stats, setStats] = useState({
    criticalCount: 0,
    warningCount: 0,
    totalLowStock: 0,
  })

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/api/lowstock/low-stock")
      if (!response.ok) {
        throw new Error("Failed to fetch low stock products")
      }
      const data = await response.json()
      setLowStockCount(data.lowStockCount)
      setLowStockProducts(data.products)
      setFilteredProducts(data.products)

      const stats = data.products.reduce(
        (acc, product) => {
          if (product.totalQuantity <= 5) {
            acc.criticalCount++
          } else if (product.totalQuantity <= 10) {
            acc.warningCount++
          }
          return acc
        },
        { criticalCount: 0, warningCount: 0, totalLowStock: data.lowStockCount },
      )
      setStats(stats)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLowStockProducts()
  }, [fetchLowStockProducts])

  useEffect(() => {
    const filtered = lowStockProducts.filter((product) => {
      return (
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    const sortedProducts = [...filtered].sort((a, b) => {
      if (sortConfig.key === "totalQuantity") {
        return sortConfig.direction === "asc" ? a.totalQuantity - b.totalQuantity : b.totalQuantity - a.totalQuantity
      }
      return 0
    })

    setFilteredProducts(sortedProducts)
  }, [searchTerm, lowStockProducts, sortConfig])

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleExport = () => {
    const exportData = filteredProducts.map((product) => ({
      Description: product.description,
      Barcode: product.barcode,
      "Current Stock": product.totalQuantity,
      Status: product.totalQuantity <= 5 ? "Critical" : "Warning",
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "LowStock")
    XLSX.writeFile(workbook, `low_stock_report_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600">Loading low stock report...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <FaExclamationTriangle className="text-red-500 text-5xl mb-4" />
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <Button color="failure" onClick={fetchLowStockProducts}>
          <FaSyncAlt className="mr-2" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl mb-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaWarehouse className="text-3xl text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Low Stock Report</h1>
            <p className="text-sm text-gray-600">Monitor and manage inventory levels</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button gradientDuoTone="purpleToBlue" onClick={handlePrint}>
            <FaPrint className="mr-2" /> Print
          </Button>
          <Button gradientDuoTone="cyanToBlue" onClick={handleExport}>
            <FaFileExcel className="mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-none shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FaExclamationTriangle className="text-2xl text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Critical Stock</p>
              <p className="text-2xl font-bold text-gray-800">{stats.criticalCount}</p>
              <p className="text-xs text-gray-500">Items with stock ≤ 5</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-none shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FaCartArrowDown className="text-2xl text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Warning Level</p>
              <p className="text-2xl font-bold text-gray-800">{stats.warningCount}</p>
              <p className="text-xs text-gray-500">Items with stock ≤ 10</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaBox className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Low Stock</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalLowStock}</p>
              <p className="text-xs text-gray-500">Items needing attention</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <div className="relative">
          <TextInput
            type="text"
            placeholder="Search by product name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FaSearch}
            className="w-full"
          />
        </div>
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="bg-gray-50">
                <div className="flex items-center gap-2">
                  <FaBox className="text-gray-500" />
                  <span>Product</span>
                </div>
              </Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">
                <div className="flex items-center gap-2">
                  <FaBarcode className="text-gray-500" />
                  <span>Barcode</span>
                </div>
              </Table.HeadCell>
              <Table.HeadCell className="bg-gray-50 cursor-pointer" onClick={() => handleSort("totalQuantity")}>
                <div className="flex items-center gap-2">
                  <FaWarehouse className="text-gray-500" />
                  <span>Current Stock</span>
                </div>
              </Table.HeadCell>
              <Table.HeadCell className="bg-gray-50">Status</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredProducts.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <FaBox className="text-gray-400 text-4xl" />
                      <p className="text-gray-500">No products with low stock found</p>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredProducts.map((product) => (
                  <Table.Row key={product._id} className="bg-white">
                    <Table.Cell className="font-medium">{product.description}</Table.Cell>
                    <Table.Cell>{product.barcode}</Table.Cell>
                    <Table.Cell>{product.totalQuantity}</Table.Cell>
                    <Table.Cell>
                      <Badge color={product.totalQuantity <= 5 ? "failure" : "warning"} className="font-medium">
                        {product.totalQuantity <= 5 ? "Critical" : "Warning"}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .overflow-x-auto,
          .overflow-x-auto * {
            visibility: visible;
          }
          .overflow-x-auto {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}


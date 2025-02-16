"use client"

import { useState, useEffect } from "react"
import { Card, Table, Spinner, Badge } from "flowbite-react"
import {
  FaMoneyBillWave,
  FaShoppingCart,
  FaPercentage,
  FaStar,
  FaCrown,
  FaChartLine,
  FaCalendarDay,
} from "react-icons/fa"

export default function DailyReportContent() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/sales/")
        if (!response.ok) throw new Error("Failed to fetch sales data")
        const data = await response.json()
        setSales(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSales()
  }, [])

  const { totalSales, totalTransactions, totalDiscounts, trendingProducts, customerSales } = sales.reduce(
    (acc, sale) => {
      acc.totalSales += sale.finalAmount || 0
      acc.totalTransactions++
      acc.totalDiscounts += sale.discount || 0

      sale.products.forEach((item) => {
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

  const SummaryCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h5 className="text-lg font-semibold text-gray-700">{title}</h5>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <Icon className={`text-${color}-600`} size={24} />
      </div>
      <p className={`text-2xl font-bold text-${color}-600 mt-2`}>{value}</p>
    </Card>
  )

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
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Daily Sales Report</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Total Sales" value={`Tk ${totalSales.toFixed(2)}`} icon={FaMoneyBillWave} color="green" />
        <SummaryCard title="Transactions" value={totalTransactions} icon={FaShoppingCart} color="blue" />
        <SummaryCard
          title="Total Discounts"
          value={`Tk ${totalDiscounts.toFixed(2)}`}
          icon={FaPercentage}
          color="red"
        />
        {bestSellingProduct && (
          <SummaryCard
            title="Best Seller"
            value={`Tk ${bestSellingProduct.totalSales.toFixed(2)}`}
            subtitle={bestSellingProduct.description}
            icon={FaStar}
            color="yellow"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaChartLine className="mr-2 text-blue-600" /> Trending Products
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <Table.Head>
                <Table.HeadCell>Product</Table.HeadCell>
                <Table.HeadCell>Barcode</Table.HeadCell>
                <Table.HeadCell>Quantity Sold</Table.HeadCell>
                <Table.HeadCell>Total Sales</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {topProducts.map((product, index) => (
                  <Table.Row key={index} className="bg-white">
                    <Table.Cell className="font-medium">{product.description}</Table.Cell>
                    <Table.Cell>{product.barcode}</Table.Cell>
                    <Table.Cell>
                      <Badge color="info" size="sm">
                        {product.quantity}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>Tk {product.totalSales.toFixed(2)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCrown className="mr-2 text-yellow-500" /> Best Customer
          </h2>
          {bestCustomer ? (
            <div>
              <p className="text-lg font-semibold text-gray-800">{bestCustomer[0]}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                Total Spent: Tk {bestCustomer[1].totalAmount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Transactions: {bestCustomer[1].transactions}</p>
            </div>
          ) : (
            <p className="text-gray-500">No customer data available</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaCalendarDay className="mr-2 text-indigo-600" /> Sales Transactions
        </h2>
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.HeadCell>Invoice No</Table.HeadCell>
              <Table.HeadCell>Transaction No</Table.HeadCell>
              <Table.HeadCell>Customer</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Payment Method</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {sales.map((sale) => (
                <Table.Row key={sale._id} className="bg-white">
                  <Table.Cell>{sale.invoiceNo || "N/A"}</Table.Cell>
                  <Table.Cell>{sale.transactionNo || "N/A"}</Table.Cell>
                  <Table.Cell>{sale.customerName || "Walk-in"}</Table.Cell>
                  <Table.Cell className="font-medium">
                    Tk {sale.finalAmount ? sale.finalAmount.toFixed(2) : "0.00"}
                  </Table.Cell>
                  <Table.Cell className="capitalize">{sale.paymentMethod || "N/A"}</Table.Cell>
                  <Table.Cell>{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : "N/A"}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  )
}


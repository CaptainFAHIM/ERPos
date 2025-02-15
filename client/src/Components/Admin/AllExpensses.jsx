"use client"

import { useState, useEffect } from "react"
import { Table, Button, Card, TextInput, Modal, Label } from "flowbite-react"
import { FaEdit, FaTrash, FaSearch, FaPrint } from "react-icons/fa"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function AllExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [editingExpense, setEditingExpense] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/expenses/")
      if (!response.ok) {
        throw new Error("Failed to fetch expenses")
      }
      const data = await response.json()
      setExpenses(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching expenses:", error)
      setError("Failed to fetch expenses. Please try again.")
      setLoading(false)
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:4000/api/expenses/${editingExpense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingExpense),
      })
      if (!response.ok) {
        throw new Error("Failed to update expense")
      }
      const updatedExpense = await response.json()
      setExpenses(expenses.map((exp) => (exp._id === updatedExpense.expense._id ? updatedExpense.expense : exp)))
      setShowEditModal(false)
    } catch (error) {
      console.error("Error updating expense:", error)
      setError("Failed to update expense. Please try again.")
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/expenses/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete expense")
      }
      setExpenses(expenses.filter((expense) => expense._id !== id))
    } catch (error) {
      console.error("Error deleting expense:", error)
      setError("Failed to delete expense. Please try again.")
    }
  }

  const calculateSummary = (filteredExpenses) => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.expenseAmount, 0)
    const thisMonth = new Date().getMonth()
    const thisMonthTotal = filteredExpenses
      .filter((expense) => new Date(expense.expenseDate).getMonth() === thisMonth)
      .reduce((sum, expense) => sum + expense.expenseAmount, 0)

    return {
      total: total.toFixed(2),
      thisMonth: thisMonthTotal.toFixed(2),
    }
  }

  const prepareChartData = (filteredExpenses) => {
    const monthlyData = {}
    filteredExpenses.forEach((expense) => {
      const month = new Date(expense.expenseDate).toLocaleString("default", { month: "short" })
      if (!monthlyData[month]) {
        monthlyData[month] = 0
      }
      monthlyData[month] += expense.expenseAmount
    })
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
  }

  const filterExpenses = () => {
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.expenseDate)
      const isInDateRange =
        (!startDate || expenseDate >= new Date(startDate)) && (!endDate || expenseDate <= new Date(endDate))
      const matchesSearch =
        expense.expenseCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.expenseNote.toLowerCase().includes(searchTerm.toLowerCase())
      return isInDateRange && matchesSearch
    })
  }

  const filteredExpenses = filterExpenses()
  const summary = calculateSummary(filteredExpenses)
  const chartData = prepareChartData(filteredExpenses)

  const handlePrint = () => {
    const printContent = document.getElementById("printableArea").innerHTML
    const originalContent = document.body.innerHTML
    document.body.innerHTML = printContent
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <h5 className="text-xl font-bold mb-2">Expense History</h5>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#0891b2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h5 className="text-xl font-bold mb-2">Expense Summary</h5>
          <div className="space-y-2">
            <p>Total Expenses: ৳{summary.total}</p>
            <p>This Month: ৳{summary.thisMonth}</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <TextInput
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <TextInput type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <TextInput
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FaSearch}
          />
        </div>
        <Button onClick={() => setShowPrintModal(true)}>
          <FaPrint className="mr-2" />
          Print Expenses
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>Date</Table.HeadCell>
            <Table.HeadCell>Category</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
            <Table.HeadCell>Note</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredExpenses.map((expense) => (
              <Table.Row key={expense._id}>
                <Table.Cell>{new Date(expense.expenseDate).toLocaleDateString()}</Table.Cell>
                <Table.Cell>{expense.expenseCategory}</Table.Cell>
                <Table.Cell>৳{expense.expenseAmount.toFixed(2)}</Table.Cell>
                <Table.Cell>{expense.expenseNote}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    <Button
                      color="info"
                      size="sm"
                      className="rounded-l-lg rounded-r-none"
                      onClick={() => handleEdit(expense)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      color="failure"
                      size="sm"
                      className="rounded-l-none rounded-r-lg"
                      onClick={() => handleDelete(expense._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header>Edit Expense</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editExpenseDate">Date</Label>
                <TextInput
                  id="editExpenseDate"
                  type="date"
                  value={editingExpense?.expenseDate.split("T")[0] || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, expenseDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editExpenseCategory">Category</Label>
                <TextInput
                  id="editExpenseCategory"
                  type="text"
                  value={editingExpense?.expenseCategory || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, expenseCategory: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editExpenseAmount">Amount</Label>
                <TextInput
                  id="editExpenseAmount"
                  type="number"
                  value={editingExpense?.expenseAmount || ""}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, expenseAmount: Number.parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="editExpenseNote">Note</Label>
                <TextInput
                  id="editExpenseNote"
                  type="text"
                  value={editingExpense?.expenseNote || ""}
                  onChange={(e) => setEditingExpense({ ...editingExpense, expenseNote: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button type="submit">Update Expense</Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showPrintModal} onClose={() => setShowPrintModal(false)}>
        <Modal.Header>Print Expenses</Modal.Header>
        <Modal.Body>
          <p>This will print the currently filtered expenses.</p>
          <div className="mt-4">
            <Button onClick={handlePrint}>Print</Button>
          </div>
        </Modal.Body>
      </Modal>

      <div id="printableArea" style={{ display: "none" }}>
        <h2 className="text-2xl font-bold mb-4">Expense Report</h2>
        <p>
          From: {startDate || "All time"} To: {endDate || "Present"}
        </p>
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Amount</th>
              <th className="border border-gray-300 px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense._id}>
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 px-4 py-2">{expense.expenseCategory}</td>
                <td className="border border-gray-300 px-4 py-2">৳{expense.expenseAmount.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2">{expense.expenseNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


import { useState } from "react"
import { Table, Button, Modal, TextInput, Select, Card } from "flowbite-react"
import { FaPlus, FaEdit, FaTrash, FaFileInvoice } from "react-icons/fa"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function SalesRecordContent() {
  const [sales, setSales] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newSale, setNewSale] = useState({
    invoiceNo: "",
    customer: "",
    date: "",
    amount: "",
    status: "completed",
  })

  const salesData = [
    { date: "2023-05-01", amount: 1200 },
    { date: "2023-05-02", amount: 1900 },
    { date: "2023-05-03", amount: 1500 },
    { date: "2023-05-04", amount: 2100 },
    { date: "2023-05-05", amount: 1800 },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewSale({ ...newSale, [name]: value })
  }

  const handleAddSale = () => {
    setSales([...sales, { ...newSale, id: Date.now() }])
    setShowModal(false)
    setNewSale({
      invoiceNo: "",
      customer: "",
      date: "",
      amount: "",
      status: "completed",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Records</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h5 className="text-xl font-bold mb-2">Daily Sales</h5>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#0891b2" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h5 className="text-xl font-bold mb-2">Sales Trend</h5>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#0891b2" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Table striped>
        <Table.Head>
          <Table.HeadCell>Invoice No</Table.HeadCell>
          <Table.HeadCell>Customer</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {sales.map((sale) => (
            <Table.Row key={sale.id}>
              <Table.Cell>{sale.invoiceNo}</Table.Cell>
              <Table.Cell>{sale.customer}</Table.Cell>
              <Table.Cell>{sale.date}</Table.Cell>
              <Table.Cell>${sale.amount}</Table.Cell>
              <Table.Cell>
                <span
                  className={`px-2 py-1 rounded ${
                    sale.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {sale.status}
                </span>
              </Table.Cell>
              <Table.Cell>
                <Button.Group>
                  <Button color="info" size="sm">
                    <FaEdit />
                  </Button>
                  <Button color="failure" size="sm">
                    <FaTrash />
                  </Button>
                  <Button color="success" size="sm">
                    <FaFileInvoice />
                  </Button>
                </Button.Group>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-end mt-4">
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add Sale
        </Button>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>New Sale Entry</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              label="Invoice No"
              name="invoiceNo"
              value={newSale.invoiceNo}
              onChange={handleInputChange}
              placeholder="Enter invoice number"
            />
            <TextInput
              label="Customer"
              name="customer"
              value={newSale.customer}
              onChange={handleInputChange}
              placeholder="Enter customer name"
            />
            <TextInput type="date" label="Date" name="date" value={newSale.date} onChange={handleInputChange} />
            <TextInput
              type="number"
              label="Amount"
              name="amount"
              value={newSale.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
            />
            <Select label="Status" name="status" value={newSale.status} onChange={handleInputChange}>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddSale}>Save</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


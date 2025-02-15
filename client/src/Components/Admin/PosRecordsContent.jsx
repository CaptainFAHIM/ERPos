import { useState } from "react"
import { Table, Button, Modal, TextInput, Select, Card } from "flowbite-react"
import { FaPlus, FaEdit, FaTrash, FaReceipt } from "react-icons/fa"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export default function PosRecordsContent() {
  const [posRecords, setPosRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newRecord, setNewRecord] = useState({
    transactionId: "",
    cashier: "",
    date: "",
    amount: "",
    paymentMethod: "cash",
  })

  const paymentMethodData = [
    { name: "Cash", value: 4000 },
    { name: "Credit Card", value: 3000 },
    { name: "Debit Card", value: 2000 },
    { name: "Mobile Payment", value: 1000 },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewRecord({ ...newRecord, [name]: value })
  }

  const handleAddRecord = () => {
    setPosRecords([...posRecords, { ...newRecord, id: Date.now() }])
    setShowModal(false)
    setNewRecord({
      transactionId: "",
      cashier: "",
      date: "",
      amount: "",
      paymentMethod: "cash",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">POS Records</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h5 className="text-xl font-bold mb-2">Payment Methods</h5>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h5 className="text-xl font-bold mb-2">POS Summary</h5>
          <div className="space-y-2">
            <p>Total Transactions: {posRecords.length}</p>
            <p>
              Total Sales: ${posRecords.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0).toFixed(2)}
            </p>
            <p>
              Average Transaction: $
              {(
                posRecords.reduce((sum, record) => sum + Number.parseFloat(record.amount), 0) / posRecords.length || 0
              ).toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      <Table striped>
        <Table.Head>
          <Table.HeadCell>Transaction ID</Table.HeadCell>
          <Table.HeadCell>Cashier</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Amount</Table.HeadCell>
          <Table.HeadCell>Payment Method</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {posRecords.map((record) => (
            <Table.Row key={record.id}>
              <Table.Cell>{record.transactionId}</Table.Cell>
              <Table.Cell>{record.cashier}</Table.Cell>
              <Table.Cell>{record.date}</Table.Cell>
              <Table.Cell>${record.amount}</Table.Cell>
              <Table.Cell>{record.paymentMethod}</Table.Cell>
              <Table.Cell>
                <Button.Group>
                  <Button color="info" size="sm">
                    <FaEdit />
                  </Button>
                  <Button color="failure" size="sm">
                    <FaTrash />
                  </Button>
                  <Button color="success" size="sm">
                    <FaReceipt />
                  </Button>
                </Button.Group>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-end mt-4">
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add POS Record
        </Button>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>New POS Record</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              label="Transaction ID"
              name="transactionId"
              value={newRecord.transactionId}
              onChange={handleInputChange}
              placeholder="Enter transaction ID"
            />
            <TextInput
              label="Cashier"
              name="cashier"
              value={newRecord.cashier}
              onChange={handleInputChange}
              placeholder="Enter cashier name"
            />
            <TextInput type="date" label="Date" name="date" value={newRecord.date} onChange={handleInputChange} />
            <TextInput
              type="number"
              label="Amount"
              name="amount"
              value={newRecord.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
            />
            <Select
              label="Payment Method"
              name="paymentMethod"
              value={newRecord.paymentMethod}
              onChange={handleInputChange}
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="mobile">Mobile Payment</option>
            </Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddRecord}>Save</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


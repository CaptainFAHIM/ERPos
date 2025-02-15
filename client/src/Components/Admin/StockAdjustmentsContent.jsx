import { useState, useEffect } from "react"
import { Button, TextInput, Table, Modal } from "flowbite-react"
import { FaUser, FaSearch, FaEdit, FaTrash } from "react-icons/fa"
import axios from "axios"

export default function StockAdjustmentsContent() {
  const [adjustment, setAdjustment] = useState({
    referenceNo: "",
    supplier: "",
    stockInBy: "",
    stockInDate: "",
    contactPerson: "",
    address: "",
    productName: "",
    barcode: "",
    quantity: "",
  })

  const [stockInEntries, setStockInEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStockInEntries()
  }, [])

  const fetchStockInEntries = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/stockin")
      setStockInEntries(response.data)
    } catch (error) {
      console.error("Error fetching stock-in entries:", error)
    }
  }

  const handleInputChange = (e) => {
    setAdjustment({ ...adjustment, [e.target.name]: e.target.value })
  }

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
    setAdjustment(entry)
    setShowEditModal(true)
  }

  const handleUpdateEntry = async () => {
    try {
      await axios.put(`http://localhost:4000/api/stockin/${selectedEntry._id}`, adjustment)
      fetchStockInEntries()
      setShowEditModal(false)
      setSelectedEntry(null)
      setAdjustment({
        referenceNo: "",
        supplier: "",
        stockInBy: "",
        stockInDate: "",
        contactPerson: "",
        address: "",
        productName: "",
        barcode: "",
        quantity: "",
      })
    } catch (error) {
      console.error("Error updating stock-in entry:", error)
    }
  }

  const handleDeletePrompt = (id) => {
    setDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleDeleteEntry = async () => {
    try {
      await axios.delete(`http://localhost:4000/api/stockin/${deleteId}`)
      fetchStockInEntries()
      setShowDeleteModal(false)
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting stock-in entry:", error)
    }
  }

  const filteredEntries = stockInEntries.filter(
    (entry) =>
      entry.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Header with Stock Adjustment title */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <FaUser className="text-2xl mr-2" />
            <span className="text-lg">fahim1234</span>
          </div>
          <h2 className="text-xl font-semibold text-right">Stock Adjustment</h2>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TextInput
              icon={FaSearch}
              placeholder="Search by Reference No or Product Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="overflow-x-auto">
            <Table striped>
              <Table.Head className="bg-gray-200 text-gray-700">
                <Table.HeadCell className="!p-4">Reference No</Table.HeadCell>
                <Table.HeadCell className="!p-4">Product Name</Table.HeadCell>
                <Table.HeadCell className="!p-4">Barcode</Table.HeadCell>
                <Table.HeadCell className="!p-4">Quantity</Table.HeadCell>
                <Table.HeadCell className="!p-4">Stock In Date</Table.HeadCell>
                <Table.HeadCell className="!p-4">Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredEntries.map((entry) => (
                  <Table.Row key={entry._id}>
                    <Table.Cell className="!p-4">{entry.referenceNo}</Table.Cell>
                    <Table.Cell className="!p-4">{entry.productName}</Table.Cell>
                    <Table.Cell className="!p-4">{entry.barcode}</Table.Cell>
                    <Table.Cell className="!p-4">{entry.quantity}</Table.Cell>
                    <Table.Cell className="!p-4">{new Date(entry.stockInDate).toLocaleDateString()}</Table.Cell>
                    <Table.Cell className="!p-4">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSelectEntry(entry)}>
                          <FaEdit />
                        </Button>
                        <Button size="sm" color="failure" onClick={() => handleDeletePrompt(entry._id)}>
                          <FaTrash />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal show={showEditModal} onClose={() => setShowEditModal(false)} size="xl">
          <Modal.Header>Update Stock-In Entry</Modal.Header>
          <Modal.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Supplier Details</h3>
                <div className="space-y-2">
                  <label>Supplier:</label>
                  <TextInput name="supplier" value={adjustment.supplier} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label>Contact Person:</label>
                  <TextInput name="contactPerson" value={adjustment.contactPerson} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label>Address:</label>
                  <TextInput name="address" value={adjustment.address} onChange={handleInputChange} />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Product Details</h3>
                <div className="space-y-2">
                  <label>Product Name:</label>
                  <TextInput name="productName" value={adjustment.productName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label>Barcode:</label>
                  <TextInput name="barcode" value={adjustment.barcode} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <label>Quantity:</label>
                  <TextInput name="quantity" type="number" value={adjustment.quantity} onChange={handleInputChange} />
                </div>
              </div>

              {/* Other Details */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="font-bold text-lg">Other Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label>Reference No:</label>
                    <TextInput name="referenceNo" value={adjustment.referenceNo} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label>Stock In By:</label>
                    <TextInput name="stockInBy" value={adjustment.stockInBy} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <label>Stock In Date:</label>
                    <TextInput
                      name="stockInDate"
                      type="date"
                      value={adjustment.stockInDate.split("T")[0]}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleUpdateEntry}>Save Changes</Button>
            <Button color="gray" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} size="md" popup onClose={() => setShowDeleteModal(false)}>
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <FaTrash className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this stock-in entry?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="failure" onClick={handleDeleteEntry}>
                  Yes, I'm sure
                </Button>
                <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  )
}

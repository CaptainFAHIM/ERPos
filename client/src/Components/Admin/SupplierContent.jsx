"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Table, Button, TextInput, Spinner } from "flowbite-react"
import { FaEdit, FaTrash, FaSave, FaSearch } from "react-icons/fa"

export default function SupplierContent() {
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSuppliers()
  }, [])

  useEffect(() => {
    const filtered = suppliers.filter((supplier) =>
      Object.values(supplier).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredSuppliers(filtered)
  }, [searchTerm, suppliers])

  const fetchSuppliers = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("http://localhost:4000/api/suppliers")
      setSuppliers(response.data)
      setFilteredSuppliers(response.data)
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewSupplier({ ...newSupplier, [name]: value })
  }

  const handleSaveSupplier = async () => {
    setIsLoading(true)
    try {
      if (editingSupplier) {
        await axios.put(`http://localhost:4000/api/suppliers/${editingSupplier._id}`, newSupplier)
      } else {
        await axios.post("http://localhost:4000/api/suppliers", newSupplier)
      }
      fetchSuppliers()
      setEditingSupplier(null)
      setNewSupplier({ name: "", contactPerson: "", phone: "", email: "", address: "" })
      setIsAdding(false)
    } catch (error) {
      console.error("Error saving supplier:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setNewSupplier(supplier)
    setIsAdding(true)
  }

  const handleDelete = async (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      setIsLoading(true)
      try {
        await axios.delete(`http://localhost:4000/api/suppliers/${supplierId}`)
        fetchSuppliers()
      } catch (error) {
        console.error("Error deleting supplier:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto  max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Suppliers</h1>
        <Button onClick={() => setIsAdding(!isAdding)} className="w-full sm:w-auto">
          {isAdding ? "Cancel" : "Add Supplier"}
        </Button>
      </div>

      <div className="mb-4 w-full sm:w-64">
        <TextInput
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FaSearch}
        />
      </div>

      {isAdding && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <TextInput name="name" value={newSupplier.name} onChange={handleInputChange} placeholder="Supplier Name" />
          <TextInput
            name="contactPerson"
            value={newSupplier.contactPerson}
            onChange={handleInputChange}
            placeholder="Contact Person"
          />
          <TextInput name="phone" value={newSupplier.phone} onChange={handleInputChange} placeholder="Phone" />
          <TextInput
            name="email"
            value={newSupplier.email}
            onChange={handleInputChange}
            placeholder="Email"
            type="email"
          />
          <TextInput
            name="address"
            value={newSupplier.address}
            onChange={handleInputChange}
            placeholder="Address"
            className="col-span-2"
          />
          <Button onClick={handleSaveSupplier} disabled={isLoading} className="col-span-2">
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <FaSave className="mr-2" /> Save Supplier
              </>
            )}
          </Button>
        </div>
      )}

      {isLoading && !isAdding ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table striped>
            <Table.Head>
              <Table.HeadCell>No.</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Contact Person</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Address</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filteredSuppliers.map((supplier, index) => (
                <Table.Row key={supplier._id}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell>{supplier.name}</Table.Cell>
                  <Table.Cell>{supplier.contactPerson}</Table.Cell>
                  <Table.Cell>{supplier.phone}</Table.Cell>
                  <Table.Cell>{supplier.email}</Table.Cell>
                  <Table.Cell>{supplier.address}</Table.Cell>
                  <Table.Cell>
                    <div className="flex">
                      <Button color="info" size="sm" onClick={() => handleEdit(supplier)} className="rounded-r-none">
                        <FaEdit />
                      </Button>
                      <Button
                        color="failure"
                        size="sm"
                        onClick={() => handleDelete(supplier._id)}
                        className="rounded-l-none"
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
      )}
    </div>
  )
}


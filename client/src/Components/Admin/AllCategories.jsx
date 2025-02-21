"use client"

import { useState, useEffect } from "react"
import { Table, Button, Card, TextInput, Modal, Label, Spinner } from "flowbite-react"
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa"

export default function AllCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingCategory, setEditingCategory] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/expenseCategories/")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to fetch categories. Please try again.")
      setLoading(false)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:4000/api/expenseCategories/${editingCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: editingCategory.categoryName }),
      })
      if (!response.ok) {
        throw new Error("Failed to update category")
      }
      const updatedCategory = await response.json()
      setCategories(
        categories.map((cat) => (cat._id === updatedCategory.category._id ? updatedCategory.category : cat)),
      )
      setShowEditModal(false)
    } catch (error) {
      console.error("Error updating category:", error)
      setError("Failed to update category. Please try again.")
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/expenseCategories/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete category")
      }
      setCategories(categories.filter((category) => category._id !== id))
    } catch (error) {
      console.error("Error deleting category:", error)
      setError("Failed to delete category. Please try again.")
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch("http://localhost:4000/api/expenseCategories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName: newCategoryName }),
      })
      if (!response.ok) {
        throw new Error("Failed to add category")
      }
      const newCategory = await response.json()
      setCategories([...categories, newCategory.expenseCategory])
      setNewCategoryName("")
    } catch (error) {
      console.error("Error adding category:", error)
      setError("Failed to add category. Please try again.")
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return (
     <div className="flex items-center justify-center min-h-screen">
       <Spinner aria-label="Loading..." size="xl" />
     </div>
   );
  if (error) return <div>{error}</div>

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <h5 className="text-xl font-bold mb-2">Add New Category</h5>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <TextInput
            type="text"
            placeholder="Enter category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            className="flex-grow"
          />
          <Button type="submit">
            <FaPlus className="mr-2" />
            Add Category
          </Button>
        </form>
      </Card>

      <div className="mb-4">
        <TextInput
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={FaSearch}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-300 bg-white">
  <Table hoverable className="w-full">
    <Table.Head className="bg-gradient-to-r from-blue-100 to-gray-200">
      <Table.HeadCell className="text-gray-900 font-bold text-lg py-3">Category Name</Table.HeadCell>
      <Table.HeadCell className="text-gray-900 font-bold text-lg py-3">Actions</Table.HeadCell>
    </Table.Head>
    <Table.Body className="divide-y divide-gray-200">
      {filteredCategories.map((category) => (
        <Table.Row key={category._id} className="hover:bg-gray-100 transition-all duration-200">
          <Table.Cell className="py-3 px-4 text-gray-700">{category.categoryName}</Table.Cell>
          <Table.Cell className="py-3 px-4">
            <div className="flex space-x-2">
              <Button
                color="info"
                size="sm"
                className="rounded-full px-1 shadow-md flex items-center gap-2"
                onClick={() => handleEdit(category)}
              >
                <FaEdit />
              </Button>
              <Button
                color="failure"
                size="sm"
                className="rounded-full px-1 shadow-md flex items-center gap-2"
                onClick={() => handleDelete(category._id)}
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
        <Modal.Header>Edit Category</Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate}>
            <div className="mb-4">
              <Label htmlFor="editCategoryName">Category Name</Label>
              <TextInput
                id="editCategoryName"
                type="text"
                value={editingCategory?.categoryName || ""}
                onChange={(e) => setEditingCategory({ ...editingCategory, categoryName: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Update Category</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  )
}


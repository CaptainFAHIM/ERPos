"use client"

import { useState, useEffect } from "react"
import { Table, Button, Card, TextInput, Modal, Label } from "flowbite-react"
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

  if (loading) return <div>Loading...</div>
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

      <div className="overflow-x-auto">
        <Table striped>
          <Table.Head>
            <Table.HeadCell>Category Name</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {filteredCategories.map((category) => (
              <Table.Row key={category._id}>
                <Table.Cell>{category.categoryName}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    <Button
                      color="info"
                      size="sm"
                      className="rounded-l-lg rounded-r-none"
                      onClick={() => handleEdit(category)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      color="failure"
                      size="sm"
                      className="rounded-l-none rounded-r-lg"
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


import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, TextInput } from "flowbite-react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function CategoryContent() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSave = async () => {
    if (!newCategory.trim()) return;

    try {
      if (editingId) {
        await axios.put(`http://localhost:4000/api/categories/${editingId}`, {
          categoryName: newCategory,
        });
      } else {
        await axios.post("http://localhost:4000/api/categories/", {
          categoryName: newCategory,
        });
      }
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
    }

    setShowModal(false);
    setNewCategory("");
    setEditingId(null);
  };

  const handleEdit = (category) => {
    setNewCategory(category.categoryName);
    setEditingId(category._id);
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:4000/api/categories/${categoryId}`);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <Table striped>
        <Table.Head>
          <Table.HeadCell>No.</Table.HeadCell>
          <Table.HeadCell>Category Name</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {categories.map((category, index) => (
            <Table.Row key={category._id}>
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell>{category.categoryName}</Table.Cell>
              <Table.Cell>
                <Button.Group>
                  <Button color="info" size="sm" onClick={() => handleEdit(category)}>
                    <FaEdit />
                  </Button>
                  <Button color="failure" size="sm" onClick={() => handleDelete(category._id)}>
                    <FaTrash />
                  </Button>
                </Button.Group>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-end mt-4">
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add Category
        </Button>
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setNewCategory("");
          setEditingId(null);
        }}
      >
        <Modal.Header>Add/Edit Category</Modal.Header>
        <Modal.Body>
          <TextInput
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category Name"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave}>Save</Button>
          <Button
            color="gray"
            onClick={() => {
              setShowModal(false);
              setNewCategory("");
              setEditingId(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
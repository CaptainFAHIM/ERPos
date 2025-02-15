import { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, TextInput } from "flowbite-react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function BrandContent() {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/brands/");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleSave = async () => {
    if (!newBrand.trim()) return;

    try {
      if (editingId) {
        await axios.put(`http://localhost:4000/api/brands/${editingId}`, {
          brandName: newBrand,
        });
      } else {
        await axios.post("http://localhost:4000/api/brands/", {
          brandName: newBrand,
        });
      }
      fetchBrands();
    } catch (error) {
      console.error("Error saving brand:", error);
    }

    setShowModal(false);
    setNewBrand("");
    setEditingId(null);
  };

  const handleEdit = (brand) => {
    setNewBrand(brand.brandName);
    setEditingId(brand._id);
    setShowModal(true);
  };

  const handleDelete = async (brandId) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        await axios.delete(`http://localhost:4000/api/brands/${brandId}`);
        fetchBrands();
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Brands</h1>
      <Table striped>
        <Table.Head>
          <Table.HeadCell>No.</Table.HeadCell>
          <Table.HeadCell>Brand Name</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {brands.map((brand, index) => (
            <Table.Row key={brand._id}>
              <Table.Cell>{index + 1}</Table.Cell>
              <Table.Cell>{brand.brandName}</Table.Cell>
              <Table.Cell>
                <Button.Group>
                  <Button color="info" size="sm" onClick={() => handleEdit(brand)}>
                    <FaEdit />
                  </Button>
                  <Button color="failure" size="sm" onClick={() => handleDelete(brand._id)}>
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
          <FaPlus className="mr-2" /> Add Brand
        </Button>
      </div>

      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setNewBrand("");
          setEditingId(null);
        }}
      >
        <Modal.Header>Add/Edit Brand</Modal.Header>
        <Modal.Body>
          <TextInput
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="Brand Name"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave}>Save</Button>
          <Button
            color="gray"
            onClick={() => {
              setShowModal(false);
              setNewBrand("");
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
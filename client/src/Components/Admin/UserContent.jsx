import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Button, Modal, TextInput, Select, Card, Spinner } from "flowbite-react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";

export default function UserContent() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    password: "",
    role: "cashier",
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleAddOrUpdateUser = async () => {
    setLoading(true);
    setError("");

    try {
      if (editMode) {
        // Update user
        await axios.put(`http://localhost:4000/api/users/${selectedUser._id}`, userData);
      } else {
        // Add new user
        const response = await axios.post("http://localhost:4000/api/users/add", userData);
        if (response.data.message === "Username already taken") {
          setError("Username is already in use.");
          setLoading(false);
          return;
        }
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error("Error saving user", error);
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (currentUser && currentUser._id === id) {
      setError("You cannot delete your own account.");
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/api/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setUserData({
      username: user.username,
      password: "", // Password won't be pre-filled for security reasons
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedUser(null);
    setUserData({ username: "", password: "", role: "cashier", isActive: true });
    setError("");
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add User
        </Button>
      </div>

      {/* User Statistics */}
      <Card className="mb-6">
        <h5 className="text-xl font-bold mb-2">User Statistics</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">{users.filter((user) => user.isActive).length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Admin Users</p>
            <p className="text-2xl font-bold">{users.filter((user) => user.role === "admin").length}</p>
          </div>
        </div>
      </Card>

      {/* User Table */}
      <Table striped>
        <Table.Head>
          <Table.HeadCell>Username</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {users.map((user) => (
            <Table.Row key={user._id}>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.role}</Table.Cell>
              <Table.Cell>
                <span className={`px-2 py-1 rounded ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </Table.Cell>
              <Table.Cell>
                <Button.Group>
                  <Button color="yellow" size="sm" onClick={() => handleEditUser(user)}>
                    <FaEdit />
                  </Button>
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={currentUser && currentUser._id === user._id}
                  >
                    <FaTrash />
                  </Button>
                </Button.Group>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onClose={closeModal}>
        <Modal.Header>{editMode ? "Edit User" : "Add New User"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <TextInput name="username" value={userData.username} onChange={handleInputChange} placeholder="Enter username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <TextInput name="password" type="password" value={userData.password} onChange={handleInputChange} placeholder="Enter new password (leave blank to keep the same)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <Select name="role" value={userData.role} onChange={handleInputChange}>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Select name="isActive" value={userData.isActive ? "true" : "false"} onChange={(e) => setUserData({ ...userData, isActive: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddOrUpdateUser} disabled={loading}>
            {loading ? <Spinner size="sm" className="mr-2" /> : null}
            {editMode ? "Update" : "Save"}
          </Button>
          <Button color="gray" onClick={closeModal}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

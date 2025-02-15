import { useState } from "react"
import { Table, Button, Modal, TextInput, Select, Card } from "flowbite-react"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"

export default function UserContent() {
  const [users, setUsers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "user",
    status: "active",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewUser({ ...newUser, [name]: value })
  }

  const handleAddUser = () => {
    setUsers([...users, { ...newUser, id: Date.now() }])
    setShowModal(false)
    setNewUser({
      username: "",
      email: "",
      role: "user",
      status: "active",
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <Card className="mb-6">
        <h5 className="text-xl font-bold mb-2">User Statistics</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">{users.filter((user) => user.status === "active").length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Admin Users</p>
            <p className="text-2xl font-bold">{users.filter((user) => user.role === "admin").length}</p>
          </div>
        </div>
      </Card>

      <Table striped>
        <Table.Head>
          <Table.HeadCell>Username</Table.HeadCell>
          <Table.HeadCell>Email</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.role}</Table.Cell>
              <Table.Cell>
                <span
                  className={`px-2 py-1 rounded ${
                    user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.status}
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
                </Button.Group>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-end mt-4">
        <Button onClick={() => setShowModal(true)}>
          <FaPlus className="mr-2" /> Add User
        </Button>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Add New User</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <TextInput
              label="Username"
              name="username"
              value={newUser.username}
              onChange={handleInputChange}
              placeholder="Enter username"
            />
            <TextInput
              label="Email"
              name="email"
              type="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Enter email"
            />
            <Select label="Role" name="role" value={newUser.role} onChange={handleInputChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Select>
            <Select label="Status" name="status" value={newUser.status} onChange={handleInputChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleAddUser}>Save</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}


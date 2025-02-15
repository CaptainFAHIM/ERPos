import User from "../models/users.model.js";

// Add a new user
export const addUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Validate role
        if (!["admin", "cashier"].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Allowed roles: admin, cashier" });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Create new user
        const user = new User({ username, password, role });
        await user.save();

        res.status(201).json({ message: "User added successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error adding user", error });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords (direct comparison)
        if (password !== user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Return user details
        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error });
    }
};

// Get a user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};

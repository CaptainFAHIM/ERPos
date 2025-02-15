import Supplier from "../models/Supplier.model.js";

// ✅ Create a new supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address } = req.body;

    const supplier = new Supplier({ name, contactPerson, phone, email, address });
    await supplier.save();

    res.status(201).json({ message: "Supplier added successfully", supplier });
  } catch (error) {
    res.status(500).json({ message: "Error adding supplier", error });
  }
};

// ✅ Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching suppliers", error });
  }
};

// ✅ Get supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: "Error fetching supplier", error });
  }
};

// ✅ Update a supplier
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, phone, email, address } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { name, contactPerson, phone, email, address },
      { new: true }
    );

    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    res.status(500).json({ message: "Error updating supplier", error });
  }
};

// ✅ Delete a supplier
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting supplier", error });
  }
};

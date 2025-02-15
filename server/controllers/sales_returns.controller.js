import ReturnItem from '../models/sales_returns.model.js';

// Create a new return item
export const createReturnItem = async (req, res) => {
  try {
    const newItem = new ReturnItem(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all return items
export const getAllReturnItems = async (req, res) => {
  try {
    const items = await ReturnItem.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single return item by ID
export const getReturnItemById = async (req, res) => {
  try {
    const item = await ReturnItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a return item
export const updateReturnItem = async (req, res) => {
  try {
    const item = await ReturnItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a return item
export const deleteReturnItem = async (req, res) => {
  try {
    const item = await ReturnItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

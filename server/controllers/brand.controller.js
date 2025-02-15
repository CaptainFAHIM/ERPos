import mongoose from 'mongoose';
import Brand from '../models/brand.model.js';

// Create a new brand
export const createBrand = async (req, res) => {
    try {
        const { brandName } = req.body;

        const brand = new Brand({ brandName });
        await brand.save();

        res.status(201).json({ message: 'Brand added successfully', brand });
    } catch (error) {
        res.status(500).json({ message: 'Error adding brand', error });
    }
};

// Get all brands
export const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching brands', error });
    }
};

// Update a brand
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { brandName } = req.body;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid brand ID format' });
        }

        const brand = await Brand.findByIdAndUpdate(id, { brandName }, { new: true });

        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        res.status(200).json({ message: 'Brand updated successfully', brand });
    } catch (error) {
        res.status(500).json({ message: 'Error updating brand', error });
    }
};

// Delete a brand
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid brand ID format' });
        }

        const brand = await Brand.findByIdAndDelete(id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting brand', error });
    }
};

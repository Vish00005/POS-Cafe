import Category from "../model/Category.js";

export const getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name is required" });
    const cat = await Category.create({ name: name.trim() });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "Category already exists" });
    res.status(500).json({ message: e.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

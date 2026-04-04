import Table from "../models/Table.js";

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber, seats } = req.body;

    const table = await Table.create({
      tableNumber,
      seats,
      qrCode: `http://localhost:5173/menu?table=${tableNumber}`,
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

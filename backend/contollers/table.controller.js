import Table from "../model/Table.js";

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ floor: 1, tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber, seats, floor = 1 } = req.body;

    const existing = await Table.findOne({ tableNumber });
    if (existing) {
      return res.status(400).json({ message: `Table ${tableNumber} already exists` });
    }

    const table = await Table.create({
      tableNumber,
      seats,
      floor,
      isOccupied: false,
      qrCode: `${process.env.CLIENT_URL || "http://localhost:5173"}/menu?table=${tableNumber}`,
    });

    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/v1/table/:id/status
// Cashier / Admin can mark table occupied or available
export const setTableStatus = async (req, res) => {
  try {
    const { isOccupied } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isOccupied },
      { new: true }
    );
    if (!table) return res.status(404).json({ message: "Table not found" });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internal helper — mark table occupied by tableNumber (called from order controller)
export const occupyTableByNumber = async (tableNumber) => {
  await Table.findOneAndUpdate({ tableNumber }, { isOccupied: true });
};

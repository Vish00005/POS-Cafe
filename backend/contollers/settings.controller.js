import Settings from "../model/Settings.js";

// GET /api/v1/settings — returns (or creates) the singleton settings doc
export const getSettings = async (req, res) => {
  try {
    let s = await Settings.findOne();
    if (!s) s = await Settings.create({});
    res.json(s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/v1/settings — update settings (admin only)
export const updateSettings = async (req, res) => {
  try {
    const { upiId, upiName, cafeName, currency } = req.body;
    let s = await Settings.findOne();
    if (!s) s = new Settings();
    if (upiId    !== undefined) s.upiId    = upiId;
    if (upiName  !== undefined) s.upiName  = upiName;
    if (cafeName !== undefined) s.cafeName = cafeName;
    if (currency !== undefined) s.currency = currency;
    await s.save();
    res.json(s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

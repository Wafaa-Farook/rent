// backend/routes/items.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware.js");

// GET items for owner
router.get("/owner/:ownerId", verifyToken, async (req, res) => {
  const { ownerId } = req.params;
  if (req.user.id != ownerId) return res.status(403).json({ message: "Forbidden" });
  try {
    const [items] = await db.query("SELECT * FROM items WHERE owner_id = ?", [ownerId]);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add item
router.post("/owner/:ownerId", verifyToken, async (req, res) => {
  const { ownerId } = req.params;
  const { name, description, image_url, rent_per_day } = req.body;
  if (req.user.id != ownerId) return res.status(403).json({ message: "Forbidden" });
  try {
    const [result] = await db.query(
      `INSERT INTO items (owner_id, name, description, image_url, rent_per_day)
       VALUES (?, ?, ?, ?, ?)`,
      [ownerId, name, description, image_url, rent_per_day]
    );
    const [itemRows] = await db.query("SELECT * FROM items WHERE id = ?", [result.insertId]);
    res.status(201).json({ item: itemRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT edit item
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, rent_per_day, availability } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE items SET name=?, description=?, image_url=?, rent_per_day=?, availability=?
       WHERE id=? AND owner_id=?`,
      [name, description, image_url, rent_per_day, availability, id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found or unauthorized" });
    const [rows] = await db.query("SELECT * FROM items WHERE id=?", [id]);
    res.json({ item: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE item
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM items WHERE id=? AND owner_id=?", [id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Not found or unauthorized" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// backend/routes/items.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware");

// 1. GET all items for an owner
router.get("/owner/:ownerId", verifyToken, async (req, res) => {
  const { ownerId } = req.params;
  if (req.user.id != ownerId) return res.status(403).json({ message: "Forbidden" });

  try {
    const [items] = await db.query("SELECT * FROM items WHERE owner_id = ? and is_deleted=False", [ownerId]);
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. POST - add new item
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

// 3. PUT - update item info (if not currently rented)
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, rent_per_day, availability } = req.body;

  try {
    // Prevent editing if rented
    const [rented] = await db.query(`
      SELECT 1 FROM rentals 
      WHERE item_id = ? AND request_status = 'approved' 
      AND status IN ('ongoing', 'approved')
    `, [id]);

    if (rented.length > 0) {
      return res.status(400).json({ message: "Cannot update item while it's rented." });
    }

    const [result] = await db.query(
      `UPDATE items 
       SET name=?, description=?, image_url=?, rent_per_day=?, availability=?
       WHERE id=? AND owner_id=?`,
      [name, description, image_url, rent_per_day, availability, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    const [rows] = await db.query("SELECT * FROM items WHERE id=?", [id]);
    res.json({ item: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// routes/items.js
router.delete("/:id", verifyToken, async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.id;

  try {
    // Check ownership
    const [owned] = await db.query("SELECT * FROM items WHERE id = ? AND owner_id = ?", [itemId, userId]);
    if (owned.length === 0) {
      return res.status(403).json({ message: "Unauthorized or item not found." });
    }

    // Check if item is currently rented or has approved rentals
    const [rented] = await db.query(`
      SELECT * FROM rentals 
      WHERE item_id = ? 
        AND request_status = 'approved'
        AND status IN ('ongoing', 'approved')
        AND CURDATE() BETWEEN rent_start_date AND rent_end_date
    `, [itemId]);

    if (rented.length > 0) {
      return res.status(400).json({ message: "Cannot delete item. It is currently rented or has approved rentals." });
    }

    // Perform soft delete
    await db.query("UPDATE items SET is_deleted = TRUE WHERE id = ?", [itemId]);

    res.json({ message: "Item marked as deleted successfully." });
  } catch (err) {
    console.error("Error soft-deleting item:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

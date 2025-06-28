const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware.js");

router.get("/owner/:ownerId", verifyToken, async (req, res) => {
  const ownerId = req.params.ownerId;

  try {
    const [counts] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM items WHERE owner_id = ? and is_deleted=false) AS total_items,
        (SELECT COUNT(*) FROM items WHERE owner_id = ? AND availability = TRUE and is_deleted=false) AS available_items,
        (SELECT COUNT(*) FROM rentals WHERE item_id IN (SELECT id FROM items WHERE owner_id = ?) and request_status="approved" and payment_status="paid") AS total_rentals
    `, [ownerId, ownerId, ownerId]);

    res.json(counts[0]);
  } catch (err) {
    console.error("Analytics fetch error:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});
module.exports = router;

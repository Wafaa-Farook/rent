const express = require("express");
const router = express.Router();
const db = require("../db");

// Patch route to update rental status to 'completed'
router.patch("/update-rental-status", async (req, res) => {
  try {
    const [result] = await db.query(`
      UPDATE rentals 
      SET status = 'completed' 
      WHERE status = 'ongoing' 
        AND CURDATE() > rent_end_date
    `);

    res.json({ message: "Rental statuses updated", affected: result.affectedRows });
  } catch (err) {
    console.error("Failed to update rental status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

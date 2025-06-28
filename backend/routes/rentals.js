const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware.js");

router.get("/owner/:ownerId", verifyToken, async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    const [results] = await db.query(`
      SELECT rentals.*, items.name AS item_name, users.name AS renter_name, users.email AS renter_email
      FROM rentals
      JOIN items ON rentals.item_id = items.id
      JOIN users ON rentals.renter_id = users.id
      WHERE items.owner_id = ?
      ORDER BY rentals.created_at DESC
    `, [ownerId]);

    res.json({ rentals: results });
  } catch (err) {
    console.error("Rental route error:", err.message);
    res.status(500).json({ message: "Error fetching rental requests" });
  }
});

// Approve a rental request
router.put('/approve/:id', verifyToken, async (req, res) => {
  const rentalId = req.params.id;
  try {
    const [result] = await db.query(
      "UPDATE rentals SET request_status = 'approved' WHERE id = ?",
      [rentalId]
    );
    res.json({ message: "Request approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject a rental request
router.put('/reject/:id', verifyToken, async (req, res) => {
  const rentalId = req.params.id;
  try {
    const [result] = await db.query(
      "UPDATE rentals SET request_status = 'rejected' WHERE id = ?",
      [rentalId]
    );
    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /rentals/:rentalId/mark-paid
router.patch("/:rentalId/mark-paid", verifyToken, async (req, res) => {
  const rentalId = req.params.rentalId;

  try {
    const [result] = await db.query(
      "UPDATE rentals SET payment_status = 'paid' WHERE id = ?",
      [rentalId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.json({ message: "Payment marked as paid successfully." });
  } catch (err) {
    console.error("Error marking payment:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;

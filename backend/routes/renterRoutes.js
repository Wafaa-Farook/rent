const express = require("express");
const router = express.Router();
const db = require("../db");
const { verifyToken } = require("../middleware");

// 1. Get available items
// routes/renterRoutes.js
router.get("/available", async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT * FROM items i
      WHERE i.is_deleted = FALSE
        AND NOT EXISTS (
          SELECT 1 FROM rentals r
          WHERE r.item_id = i.id
            AND r.request_status = 'approved'
            AND r.rent_end_date >= CURDATE()  -- exclude current and future bookings
        )
    `);
    res.json({ items });
  } catch (err) {
    console.error("Error fetching available items", err);
    res.status(500).json({ message: "Failed to fetch available items" });
  }
});




// routes/renterRoutes.js
router.get("/requests/:renterId", verifyToken, async (req, res) => {
  const renterId = req.params.renterId;
  try {
    const [rows] = await db.query(`
      SELECT rentals.*, items.name AS item_name
      FROM rentals
      JOIN items ON rentals.item_id = items.id
      WHERE rentals.renter_id = ?
      ORDER BY rentals.rent_start_date DESC
    `, [renterId]);

    res.json({ requests: rows });
  } catch (err) {
    console.error("Error fetching requests", err);
    res.status(500).json({ message: "Failed to fetch rental requests" });
  }
});


// routes/renterRoutes.js
router.get("/history/:renterId", verifyToken, async (req, res) => {
  const renterId = req.params.renterId;
  try {
    const [results] = await db.query(`
      SELECT 
        rentals.*, 
        items.name AS item_name,
        CASE 
          WHEN CURDATE() > rentals.rent_end_date THEN 'completed'
          ELSE rentals.status
        END AS dynamic_status
      FROM rentals
      JOIN items ON rentals.item_id = items.id
      WHERE renter_id = ? AND request_status = 'approved'
      ORDER BY rent_start_date DESC
    `, [renterId]);

    res.json({ rentals: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching rental history" });
  }
});



router.post("/", verifyToken, async (req, res) => {
  const renterId = req.user.id;
  const { item_id, rent_start_date, rent_end_date } = req.body;

  if (!item_id || !rent_start_date || !rent_end_date) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    // Convert dates to Date objects
    const start = new Date(rent_start_date);
    const end = new Date(rent_end_date);

    // Validate date order
    if (start >= end) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    // Check if item exists
    const [itemResult] = await db.query("SELECT rent_per_day FROM items WHERE id = ?", [item_id]);
    if (itemResult.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const rentPerDay = itemResult[0].rent_per_day;

    // Check for overlapping approved rentals
    const [overlap] = await db.query(`
      SELECT * FROM rentals
      WHERE item_id = ?
        AND request_status = 'approved'
        AND (
          (rent_start_date <= ? AND rent_end_date >= ?)
          OR (rent_start_date <= ? AND rent_end_date >= ?)
          OR (rent_start_date >= ? AND rent_end_date <= ?)
        )
    `, [item_id, start, start, end, end, start, end]);

    if (overlap.length > 0) {
      return res.status(409).json({ message: "Item is already booked for selected dates" });
    }

    // Prevent duplicate request from same user for same item and overlapping date
    const [duplicateCheck] = await db.query(`
      SELECT * FROM rentals
      WHERE item_id = ? AND renter_id = ? AND (
        (rent_start_date <= ? AND rent_end_date >= ?)
        OR (rent_start_date <= ? AND rent_end_date >= ?)
        OR (rent_start_date >= ? AND rent_end_date <= ?)
      )
    `, [item_id, renterId, start, start, end, end, start, end]);

    if (duplicateCheck.length > 0) {
      return res.status(409).json({ message: "You’ve already requested this item for these dates" });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = Math.round(days * rentPerDay);

    const [result] = await db.query(
      "INSERT INTO rentals (item_id, renter_id, rent_start_date, rent_end_date, total_amount, request_status, status) VALUES (?, ?, ?, ?, ?, 'pending', 'ongoing')",
      [item_id, renterId, rent_start_date, rent_end_date, totalAmount]
    );

    res.status(201).json({ message: "Rental request created", rental_id: result.insertId });
  } catch (err) {
    console.error("Error in rental request", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

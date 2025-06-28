const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. Get Owner Properties
router.get("/owner/:userId/properties", (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT id, title, location FROM properties WHERE owner_id = ? and is_deleted = FALSE",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ properties: results });
    }
  );
});

// 2. Get Rental Requests
router.get("/owner/:userId/rental-requests", (req, res) => {
  const userId = req.params.userId;
  db.query(
    `SELECT rr.id, u.name AS renterName, p.title AS propertyTitle
     FROM rental_requests rr
     JOIN users u ON rr.renter_id = u.id
     JOIN properties p ON rr.property_id = p.id
     WHERE p.owner_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ requests: results });
    }
  );
});


module.exports = router;

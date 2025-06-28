const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const itemsRoutes = require("./routes/items");
const rentalRoutes = require("./routes/rentals");
const analyticsRoutes = require("./routes/analytics");
const renterRoutes = require("./routes/renterRoutes");
const rentalUtils = require("./routes/utils");


// similarly renterRoutes if any

app.use(cors({
  origin: ["http://localhost:3000", "https://rentro-frontend-sand.vercel.app"],
  credentials: true
}));
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/renter", renterRoutes);
app.use("/api/utils", rentalUtils);

const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily rental status update...");
  try {
    await db.query(`
      UPDATE rentals 
      SET status = 'completed' 
      WHERE status = 'ongoing' 
        AND CURDATE() > rent_end_date
    `);
    console.log("Rental status update done.");
  } catch (err) {
    console.error("Cron job error:", err);
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

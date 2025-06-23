const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const itemsRoutes = require("./routes/items");
// similarly renterRoutes if any

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/items", itemsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

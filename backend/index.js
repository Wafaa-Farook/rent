const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Use cors and express.json middleware
app.use(cors());
app.use(express.json());

// Setup your MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "Wafaa",
  password: "5566",
  database: "rent",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Signup route
app.post("/api/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    // Check if user already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role],
        (err, results) => {
          if (err) throw err;

          res.status(201).json({
            message: "User registered successfully"
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter both email and password" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      "wafaajwt",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  });
});

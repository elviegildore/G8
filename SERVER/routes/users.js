// backend/routes/user.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // your database connection

// Example: get current user by ID (assuming you store userId in session or token)
router.get("/current-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const [user] = await db.query("SELECT fullname, profilePicture FROM users WHERE id = ?", [userId]);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

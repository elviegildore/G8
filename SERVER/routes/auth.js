// backend/routes/auth.js
import express from "express";
import supabase from "../supabaseClient.js";
import pkg from "bcryptjs";
import jwt from "jsonwebtoken";

const { hash, compare } = pkg;
const router = express.Router();

// ✅ JWT secret (put in .env for production)
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Predefined admin identifiers
const adminSerials = ["12345", "67890", "99999"];
const adminFullnames = ["Admin User", "Super Admin"]; // Add yours here

// ==========================
// ✅ GENERIC CHECK-UNIQUE
// ==========================
router.get("/check-unique", async (req, res) => {
  const { field, value } = req.query;

  if (!field || !value) {
    return res.status(400).json({ success: false, error: "Field and value required" });
  }

  if (!["fullname", "serial_number"].includes(field)) {
    return res.status(400).json({ success: false, error: "Invalid field" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq(field, value);

    if (error) throw error;

    res.json({ success: true, isUnique: !data || data.length === 0 });
  } catch (err) {
    console.error("check-unique error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==========================
// ✅ CHECK FULLNAME
// ==========================
router.post("/check-fullname", async (req, res) => {
  const { fullname } = req.body;
  if (!fullname) {
    return res.status(400).json({ success: false, error: "Fullname required" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("fullname", fullname);

    if (error) throw error;

    res.json({ success: true, exists: data && data.length > 0 });
  } catch (err) {
    console.error("check-fullname error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==========================
// ✅ CHECK SERIAL
// ==========================
router.post("/check-serial", async (req, res) => {
  const { serial_number } = req.body;
  if (!serial_number) {
    return res.status(400).json({ success: false, error: "Serial number required" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("serial_number", serial_number);

    if (error) throw error;

    res.json({ success: true, exists: data && data.length > 0 });
  } catch (err) {
    console.error("check-serial error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==========================
// ✅ REGISTER
// ==========================
router.post("/register", async (req, res) => {
  let { rank, fullname, serial_number, unit, office_designation, skills, password } = req.body;

  // Trim inputs
  rank = rank?.trim();
  fullname = fullname?.trim();
  serial_number = serial_number?.trim();
  unit = unit?.trim();
  office_designation = office_designation?.trim();
  skills = skills?.trim();
  password = password?.trim();

  if (!rank || !fullname || !serial_number || !unit || !office_designation || !skills || !password) {
    return res.status(400).json({ success: false, error: "All fields are required", fieldErrors: {} });
  }

  // Strong password validation
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({
      success: false,
      error: "Password must be at least 8 chars, include upper, lower, number & special character",
      fieldErrors: { password: true },
    });
  }

  try {
    // ✅ Check fullname duplicate (skip if admin fullname)
    if (!adminFullnames.includes(fullname)) {
      const { data: existingFullname, error: fullnameErr } = await supabase
        .from("users")
        .select("id")
        .eq("fullname", fullname);

      if (fullnameErr) throw fullnameErr;
      if (existingFullname && existingFullname.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Fullname already exists",
          fieldErrors: { fullname: true },
        });
      }
    }

    // ✅ Check serial duplicate (skip if admin serial)
    if (!adminSerials.includes(serial_number)) {
      const { data: existingSerial, error: serialErr } = await supabase
        .from("users")
        .select("id")
        .eq("serial_number", serial_number);

      if (serialErr) throw serialErr;
      if (existingSerial && existingSerial.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Serial number already exists",
          fieldErrors: { serial_number: true },
        });
      }
    }

    // ✅ Hash password
    const hashedPassword = await hash(password, 10);

    // Assign role
    let role = "user";
    if (adminSerials.includes(serial_number) || adminFullnames.includes(fullname)) {
      role = "admin";
    }

    // Insert user
    const { data, error } = await supabase
      .from("users")
      .insert([
        { rank, fullname, serial_number, unit, office_designation, skills, password: hashedPassword, role },
      ])
      .select()
      .single();

    if (error) throw error;

    const { password: _, ...userWithoutPassword } = data;
    res.json({ success: true, user: userWithoutPassword });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ==========================
// ✅ LOGIN (with JWT)
// ==========================
router.post("/login", async (req, res) => {
  const { fullname, serial_number, password } = req.body;

  if (!fullname || !serial_number || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("fullname", fullname)
      .eq("serial_number", serial_number)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // Force admin role if matches admin lists
    if (adminSerials.includes(user.serial_number) || adminFullnames.includes(user.fullname)) {
      user.role = "admin";
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ==========================
// ✅ LOGOUT
// ==========================
router.post("/logout", (req, res) => {
  // On client side: just remove the token
  return res.status(200).json({ success: true, message: "Logged out successfully" });
});

export default router;

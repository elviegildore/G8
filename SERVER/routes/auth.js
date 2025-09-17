// backend/routes/auth.js
import express from "express";
import supabase from "../supabaseClient.js"
import pkg from "bcryptjs";
const { hash, compare } = pkg;

const router = express.Router();

// ✅ Predefined admin serial numbers
const adminSerials = ["12345", "67890", "99999"];

// ==========================
// ✅ CHECK-UNIQUE ENDPOINT
// ==========================
router.get("/check-unique", async (req, res) => {
  const { field, value } = req.query;
  if (!field || !value) {
    return res.status(400).json({ error: "Field and value required" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select(field)
      .eq(field, value);

    if (error) throw error;
    res.json({ isUnique: data.length === 0 });
  } catch (err) {
    console.error("check-unique error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ REGISTER ENDPOINT
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
    return res.status(400).json({ error: "All fields are required", fieldErrors: {} });
  }

  // Strong password check
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({
      error: "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      fieldErrors: { password: true }
    });
  }

  try {
    // Check duplicates
    const { data: existingFullname } = await supabase
      .from("users")
      .select("id")
      .eq("fullname", fullname);

    if (existingFullname.length > 0) {
      return res.status(400).json({ error: "Fullname already exists", fieldErrors: { fullname: true } });
    }

    const { data: existingSerial } = await supabase
      .from("users")
      .select("id")
      .eq("serial_number", serial_number);

    if (existingSerial.length > 0) {
      return res.status(400).json({ error: "Serial number already exists", fieldErrors: { serial_number: true } });
    }

    // ✅ Hash password
    const hashedPassword = await hash(password, 10);

    // Assign role
    let role = "user";
    if (adminSerials.includes(serial_number)) {
      role = "admin";
    }

    // Insert user
    const { data, error } = await supabase
      .from("users")
      .insert([{
        rank,
        fullname,
        serial_number,
        unit,
        office_designation,
        skills,
        password: hashedPassword,
        role
      }])
      .select()
      .single();

    if (error) throw error;

    const { password: _, ...userWithoutPassword } = data;
    res.json({ success: true, user: userWithoutPassword });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================
// ✅ LOGIN ENDPOINT
// ==========================
router.post("/login", async (req, res) => {
  const { fullname, serial_number, password } = req.body;

  if (!fullname || !serial_number || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("fullname", fullname)
      .eq("serial_number", serial_number)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Ensure admin role if serial is in adminSerials
    if (adminSerials.includes(user.serial_number)) {
      user.role = "admin";
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Logout endpoint (optional, clears token client-side)
router.post("/logout", (req, res) => {
  // If you're using JWT stored in frontend/localStorage, just tell frontend to remove it
  return res.status(200).json({ message: "Logged out successfully" });
});

export default router;

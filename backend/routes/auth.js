const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Make sure bcryptjs is installed
const router = express.Router();
const supabase = require("../supabase"); // Adjust path if necessary
const { jwtSecret } = require("../config");

console.log("Auth route loaded");

// Register
router.post("/register", async (req, res) => {
  const { email, password, role, name } = req.body; // Expecting role in the request body

  // Basic validation
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing email, password, or role" });
  }

  // Validate role: ensure it's either 'company' or 'vendor'
  if (role !== "company" && role !== "vendor") {
    return res
      .status(400)
      .json({
        error: 'Invalid role specified. Must be "company" or "vendor".',
      });
  }

  try {
    // Check if user exists
    const { data: existing, error: findErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (findErr && findErr.code !== "PGRST116") {
      // PGRST116 means "no rows found"
      console.error("Error checking for existing user:", findErr.message);
      return res.status(500).json({ error: findErr.message });
    }

    if (existing) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Use bcryptjs for hashing

    // Insert the new user with the specified role
    const { data, error: insertErr } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword, role, name }]); // Use hashedPassword

    if (insertErr) {
      console.error("Error inserting new user:", insertErr.message);
      return res.status(500).json({ error: insertErr.message });
    }

    const user = data[0];

    // Generate JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, jwtSecret, {
      expiresIn: "1d",
    });

    // Respond with token and basic user info
    res.status(201).json({
      token,
      user: {
        id: user.id, // Include user ID in response
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (e) {
    console.error("An unexpected error occurred during registration:", e);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// Login (keep as is, or modify to return role if needed)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, jwtSecret, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.id, // Include user ID in response
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (e) {
    console.error("An unexpected error occurred during login:", e);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

module.exports = router;

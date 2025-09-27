// server/src/routes/auth.routes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

function signJwt(payload) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
}

function setAuthCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE).toLowerCase() === "true";
  // 7 days default
  const maxAgeMs =
    /^\d+$/.test(process.env.JWT_EXPIRES_IN || "")
      ? Number(process.env.JWT_EXPIRES_IN) * 1000
      : 7 * 24 * 60 * 60 * 1000;

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: maxAgeMs,
    path: "/",
  });
}

/**
 * POST /api/auth/signup
 * Creates a normal user (role is always 'user')
 * body: { name, email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role: "user" });
    // optionally auto-login after signup:
    const token = signJwt({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Signup failed" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }
    const user = await User.findOne({ email }).select("+password +role");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signJwt({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Login failed" });
  }
});

/**
 * POST /api/auth/logout
 * clears token cookie
 */
router.post("/logout", (_req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ ok: true });
});

/**
 * GET /api/auth/me
 * returns the current user (requires auth)
 */
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email role");
  res.json({ user });
});

/**
 * POST /api/auth/staff
 * Admin creates a staff user
 * body: { name, email, password }
 */
router.post("/staff", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const u = await User.create({ name, email, password, role: "staff" });
    res.status(201).json({
      user: { _id: u._id, name: u.name, email: u.email, role: u.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create staff" });
  }
});

/**
 * GET /api/auth/users?role=staff|user|admin
 * Admin-only list users (optional role filter)
 */
router.get("/users", protect, requireRole("admin"), async (req, res) => {
  try {
    const role = (req.query.role || "").trim();
    const q = {};
    if (role) q.role = role;
    const users = await User.find(q).select("name email role").sort({ name: 1 }).lean();
    res.json({ users });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to list users" });
  }
});

export default router;
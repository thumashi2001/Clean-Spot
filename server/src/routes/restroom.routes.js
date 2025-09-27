import { Router } from "express";
import { Restroom } from "../models/Restroom.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

/**
 * GET /api/restrooms
 * Query: lat, lng, radius(km), wheelchair=true|false, water=true|false, gender=male|female|unisex
 * All params optional. If lat/lng provided, returns within radius.
 */
router.get("/", async (req, res) => {
  try {
    const { lat, lng, radius, wheelchair, water, gender } = req.query;

    const q = {};
    // filters
    if (typeof wheelchair !== "undefined") q.wheelchairAccessible = wheelchair === "true";
    if (typeof water !== "undefined") q.waterAvailable = water === "true";
    if (gender && ["male", "female", "unisex"].includes(gender)) q.gender = gender;

    // geo filter
    if (lat && lng && radius) {
      const km = Number(radius) || 5;
      const rad = km / 6378.1; // Earth radius km
      q.location = {
        $geoWithin: {
          $centerSphere: [[Number(lng), Number(lat)], rad],
        },
      };
    }

    const items = await Restroom.find(q).limit(500).lean();
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch restrooms" });
  }
});

// GET single restroom
router.get("/:id", async (req, res) => {
  const item = await Restroom.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ item });
});

// Admin-only CRUD
router.post("/", protect, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, address, lat, lng, wheelchairAccessible, waterAvailable, gender } = req.body;
    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "name, lat, lng required" });
    }
    const created = await Restroom.create({
      name,
      description,
      address,
      location: { type: "Point", coordinates: [Number(lng), Number(lat)] },
      wheelchairAccessible: !!wheelchairAccessible,
      waterAvailable: waterAvailable !== false,
      gender: ["male", "female", "unisex"].includes(gender) ? gender : "unisex",
    });
    res.status(201).json({ item: created });
  } catch {
    res.status(500).json({ message: "Create failed" });
  }
});

router.put("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.lat !== undefined && update.lng !== undefined) {
      update.location = { type: "Point", coordinates: [Number(update.lng), Number(update.lat)] };
      delete update.lat; delete update.lng;
    }
    const item = await Restroom.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ item });
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const ok = await Restroom.findByIdAndDelete(req.params.id);
    if (!ok) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
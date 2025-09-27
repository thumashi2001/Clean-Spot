// server/src/routes/report.routes.js
import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { protect, requireRole } from "../middleware/auth.js";
import { Report } from "../models/Report.js";

const router = Router();

// Resolve /server/uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer: store images to /uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

/**
 * POST /api/reports
 * body: { restroomId, description }, files: photos[]
 * auth: user required
 */
router.post("/", protect, upload.array("photos", 5), async (req, res) => {
  try {
    const { restroomId, description = "" } = req.body || {};
    if (!restroomId) return res.status(400).json({ message: "restroomId required" });

    const photos = (req.files || []).map((f) => f.filename);
    const report = await Report.create({
      restroom: restroomId,
      description,
      photos,
      status: "PENDING_REVIEW",
      createdBy: req.user.id,
    });

    const populated = await Report.findById(report._id)
      .populate("restroom", "name address location")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.status(201).json({ report: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to create report" });
  }
});

/**
 * GET /api/reports
 * Admin: list all (filter by ?status=)
 * Staff: if ?mine=true → only assigned to me, else all assigned to me by default
 * Returns populated restroom/createdBy/assignedTo
 */
router.get("/", protect, async (req, res) => {
  try {
    const { status = "", mine = "" } = req.query || {};
    const q = {};
    if (status) q.status = status;

    if (req.user.role === "admin") {
      // no extra restriction
    } else if (req.user.role === "staff") {
      // staff sees only own assignments by default
      q.assignedTo = req.user.id;
      if (mine === "false") delete q.assignedTo; // allow admin-like view if needed
    } else {
      // normal users: show only their own created reports
      q.createdBy = req.user.id;
    }

    const items = await Report.find(q)
      .sort({ createdAt: -1 })
      .populate("restroom", "name address location")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .lean();

    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

/**
 * PATCH /api/reports/:id/confirm
 * Admin confirms a report (optionally assign at the same time)
 * body: { assignedTo? }
 */
router.patch("/:id/confirm", protect, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body || {};

    const update = { status: "CONFIRMED" };
    if (assignedTo !== undefined) update.assignedTo = assignedTo || null;

    const doc = await Report.findByIdAndUpdate(id, update, { new: true })
      .populate("restroom", "name address location")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!doc) return res.status(404).json({ message: "Report not found" });
    res.json({ report: doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to confirm report" });
  }
});

/**
 * PATCH /api/reports/:id/assign
 * Admin assigns a report; if it was PENDING_REVIEW → auto move to CONFIRMED
 * body: { assignedTo }
 */
router.patch("/:id/assign", protect, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body || {};

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.assignedTo = assignedTo || null;
    if (report.status === "PENDING_REVIEW") {
      report.status = "CONFIRMED"; // auto-advance so map shows “confirmed”
    }
    await report.save();

    const populated = await Report.findById(report._id)
      .populate("restroom", "name address location")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json({ report: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to assign report" });
  }
});

/**
 * PATCH /api/reports/:id/start
 * Staff (assigned) or Admin can mark IN_PROGRESS
 */
router.patch("/:id/start", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // staff must be assigned to this report
    if (req.user.role === "staff") {
      if (!report.assignedTo || String(report.assignedTo) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not your assignment" });
      }
    }

    report.status = "IN_PROGRESS";
    await report.save();

    const populated = await Report.findById(report._id)
      .populate("restroom", "name address location")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json({ report: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to start report" });
  }
});

/**
 * PATCH /api/reports/:id/resolve
 * Staff (assigned) or Admin can mark RESOLVED
 */
router.patch("/:id/resolve", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (req.user.role === "staff") {
      if (!report.assignedTo || String(report.assignedTo) !== String(req.user.id)) {
        return res.status(403).json({ message: "Not your assignment" });
      }
    }

    report.status = "RESOLVED";
    report.resolvedAt = new Date();
    await report.save();

    const populated = await Report.findById(report._id)
      .populate("restroom", "name address location")
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    res.json({ report: populated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to resolve report" });
  }
});

/**
 * GET /api/reports/status-by-restroom?ids=comma,separated
 * Returns latest active status per restroom (ignores RESOLVED)
 * [{ restroomId, status }]
 */
router.get("/status-by-restroom", async (req, res) => {
  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!ids.length) return res.json({ items: [] });

    const items = [];
    for (const rid of ids) {
      const latest = await Report.findOne({
        restroom: rid,
        status: { $ne: "RESOLVED" },
      })
        .sort({ createdAt: -1 })
        .select("status restroom")
        .lean();

      items.push({ restroomId: rid, status: latest?.status || null });
    }
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to get status map" });
  }
});

export default router;
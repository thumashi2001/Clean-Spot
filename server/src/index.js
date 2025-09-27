// server/src/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import restroomRoutes from "./routes/restroom.routes.js";
import reportRoutes from "./routes/report.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Create the app FIRST ✅
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// 2) Core middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// 3) Static uploads (path: server/uploads)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// 4) Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// 5) Routes
app.use("/api/auth", authRoutes);
app.use("/api/restrooms", restroomRoutes);
app.use("/api/reports", reportRoutes);

// 6) Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 4000;

// 7) Start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 API running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error("DB connect failed", e);
    process.exit(1);
  });
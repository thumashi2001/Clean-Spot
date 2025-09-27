// server/src/models/Report.js
import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    restroom: { type: mongoose.Schema.Types.ObjectId, ref: "Restroom", required: true },
    description: { type: String, default: "" },
    photos: { type: [String], default: [] }, // <- multiple filenames
    status: {
      type: String,
      enum: ["PENDING_REVIEW", "CONFIRMED", "IN_PROGRESS", "RESOLVED"],
      default: "PENDING_REVIEW",
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Helpful index: “open” latest per restroom
ReportSchema.index({ restroom: 1, status: 1, createdAt: -1 });

export const Report = mongoose.model("Report", ReportSchema);
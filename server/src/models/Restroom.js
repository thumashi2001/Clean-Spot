import mongoose from "mongoose";

const restroomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },

    // GeoJSON Point, [lng, lat]
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },

    wheelchairAccessible: { type: Boolean, default: false },
    waterAvailable: { type: Boolean, default: true },
    gender: { type: String, enum: ["male", "female", "unisex"], default: "unisex" },
  },
  { timestamps: true }
);

restroomSchema.index({ location: "2dsphere" });

export const Restroom = mongoose.model("Restroom", restroomSchema);
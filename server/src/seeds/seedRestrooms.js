import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../config/db.js";
import { Restroom } from "../models/Restroom.js";

async function run() {
  await connectDB();
  const samples = [
    {
      name: "Galle Face Green Public Toilet",
      address: "Galle Face, Colombo",
      description: "Public restroom near the promenade",
      gender: "unisex",
      wheelchairAccessible: true,
      waterAvailable: true,
      lat: 6.924, lng: 79.844,
    },
    {
      name: "Colombo Fort Station Restroom",
      address: "Fort Railway Station, Colombo",
      description: "Inside station premises",
      gender: "male",
      wheelchairAccessible: false,
      waterAvailable: true,
      lat: 6.935, lng: 79.85,
    },
    {
      name: "Independence Square Park Restroom",
      address: "Independence Ave, Colombo 07",
      description: "Near jogging track",
      gender: "female",
      wheelchairAccessible: true,
      waterAvailable: true,
      lat: 6.902, lng: 79.869,
    },
  ];

  for (const r of samples) {
    const exists = await Restroom.findOne({ name: r.name });
    if (!exists) {
      await Restroom.create({
        name: r.name,
        address: r.address,
        description: r.description,
        gender: r.gender,
        wheelchairAccessible: r.wheelchairAccessible,
        waterAvailable: r.waterAvailable,
        location: { type: "Point", coordinates: [r.lng, r.lat] },
      });
      console.log("✅ inserted:", r.name);
    } else {
      console.log("↩︎ exists:", r.name);
    }
  }
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
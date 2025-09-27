import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

async function run() {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD required in .env");
    process.exit(1);
  }

  let admin = await User.findOne({ email });
  if (admin) {
    console.log("Admin already exists:", admin.email);
    process.exit(0);
  }

  admin = await User.create({ name, email, password, role: "admin" });
  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
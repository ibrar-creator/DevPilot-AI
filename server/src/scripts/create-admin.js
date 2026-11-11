import "dotenv/config";

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import { hashPassword } from "../services/password.service.js";

const createAdmin = async () => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
    );
  }

  if (name.length < 2 || name.length > 60) {
    throw new Error("Admin name must be between 2 and 60 characters");
  }

  if (
    password.length < 8 ||
    password.length > 72 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new Error(
      "Admin password must be 8-72 characters and contain lowercase, uppercase and a number"
    );
  }
await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    throw new Error(
      "An account with this email already exists. No account was modified."
    );
  }

  const hashedPassword = await hashPassword(password);

  const admin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
    isEmailVerified: true,
    isActive: true,
  });

  console.log("Admin account created successfully.");
  console.log(`Admin ID: ${admin._id}`);
  console.log(`Admin email: ${admin.email}`);
};

try {
  await createAdmin();
} catch (error) {
  console.error("Admin creation failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
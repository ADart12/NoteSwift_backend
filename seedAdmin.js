import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./src/models/usersModel.js";
import Department from "./src/models/DepartmentModel.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_DB);

    console.log("✅ MongoDB connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      role: "admin",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      process.exit(0);
    }

    // Find Administration department
    const adminDepartment = await Department.findOne({
      code: "ADM",
    });

    if (!adminDepartment) {
      throw new Error(
        "Administration department not found. Run seedDepartment.js first."
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    // Create admin
    const admin = await User.create({
      employeeId: "ADMIN001",
      fullName: "System Administrator",
      email: "admin@example.com",
      phone: "9800000000",

      // Store Department ObjectId
      department: adminDepartment._id,

      designation: "Administrator",
      role: "admin",
      password: hashedPassword,
    });

    console.log("✅ Admin created successfully.");
    console.log("👤 Name:", admin.fullName);
    console.log("🏢 Department:", adminDepartment.name);
    console.log("🔑 Role:", admin.role);

    process.exit(0);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
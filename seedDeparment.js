import mongoose from "mongoose";
import dotenv from "dotenv";
import Department from "./src/models/DepartmentModel.js";

dotenv.config();

const departments = [
  {
    name: "Software Development",
    code: "SD",
    description: "Software development and engineering",
    status: "Active",
  },
  {
    name: "Finance",
    code: "FIN",
    description: "Finance and accounting",
    status: "Active",
  },
  {
    name: "Human Resources",
    code: "HR",
    description: "Human resources and employee management",
    status: "Active",
  },
  {
    name: "Marketing",
    code: "MKT",
    description: "Marketing and promotion",
    status: "Active",
  },
  {
    name: "Sales",
    code: "SAL",
    description: "Sales and business development",
    status: "Active",
  },
  {
    name: "Operations",
    code: "OPS",
    description: "Daily business operations",
    status: "Active",
  },
  {
    name: "Administration",
    code: "ADM",
    description: "Administrative operations",
    status: "Active",
  },
];

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);

    for (const department of departments) {
      await Department.findOneAndUpdate(
        { code: department.code },
        department,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Departments seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Department seeding failed:", error);
    process.exit(1);
  }
};

seedDepartments();
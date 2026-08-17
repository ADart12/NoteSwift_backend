
import Department from "../models/DepartmentModel.js";

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });

    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
};
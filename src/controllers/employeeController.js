import User from "../models/usersModel.js";

export const getEmployees = async (req, res) => {
  try {
    const {
      search,
      department,
      role,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {
      isDeleted: false,
    };

    // Search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (department) {
      query.department = department;
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const employees = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -      1 });

    const totalEmployees = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      totalEmployees,
      currentPage: Number(page),
      totalPages: Math.ceil(totalEmployees / limit),
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// get Employee by ID

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get Employee By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};




export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fullName,
      email,
      phone,
      department,
      designation,
      role,
      status,
      joiningDate,
    } = req.body;

    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Update only provided fields
    if (fullName !== undefined) employee.fullName = fullName;
    if (email !== undefined) employee.email = email;
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) employee.designation = designation;
    if (role !== undefined) employee.role = role;
    if (status !== undefined) employee.status = status;
    if (joiningDate !== undefined) employee.joiningDate = joiningDate;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export const updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.status = status;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee status updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update Employee Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};




export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    employee.isDeleted = true;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Employee Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



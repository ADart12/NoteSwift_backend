import Attendance from "../models/attendanceModel.js";
import User from "../models/usersModel.js";
import { nepaliDate } from "../utils/dateUtils.js"; // or your BS converter
import OfficeSettings from "../models/officeSetting.js";
import { calculateLateStatus, calculateCheckoutDetails, getDateRange } from '../utils/dateUtils.js';


export const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      dateAD: today,
    }).populate(
      "employee",
      "employeeId fullName email department designation role"
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Today's attendance not found.",
      });
    }

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("Get My Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const checkIn = async (req, res) => {
  try {
    const { employee } = req.body;      //employee -> employeeId

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee is required.",
      });
    }

    // Check employee exists
    const employeeExists = await User.findById(employee);

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // Today's date (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Prevent duplicate attendance
    const alreadyMarked = await Attendance.findOne({
      employee,
      dateAD: today,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Employee already checked in today.",
      });
    }

    const settings = await OfficeSettings.findOne();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Office settings not found.",
      });
    }

    const { now, isLate, lateMinutes } = calculateLateStatus(
      settings.officeStartTime,
      settings.gracePeriod
    );

    // Convert AD -> BS
    const dateBS = nepaliDate();

    const attendance = await Attendance.create({
      employee,
      dateAD: today,
      dateBS,

      status: "Present",

      checkIn: now,

      isLate,
      lateMinutes,

      workingHours: 0,
      overtime: 0,

      markedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Check in successful.",
      attendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const checkOut = async (req, res) => {
  try {
    const { employee } = req.body;

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee is required.",
      });
    }

    // Today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee,
      dateAD: today,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Employee has not checked in today.",
      });
    }

    // Prevent duplicate checkout
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: "Employee has already checked out.",
      });
    }

    // Check if checkIn exists
    if (!attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: "Invalid check-in time.",
      });
    }

    // Get office settings
    const officeSetting = await OfficeSettings.findOne();

    if (!officeSetting) {
      return res.status(404).json({
        success: false,
        message: "Office settings not found.",
      });
    }

    const { now, workingHours, overtime } = calculateCheckoutDetails(attendance.checkIn, officeSetting.officeEndTime);

    attendance.checkOut = now;
    attendance.workingHours = workingHours;
    attendance.overtime = overtime;

    attendance.markedBy = req.user._id;

    await attendance.save();

    return res.status(200).json({
      success: true,
      message: "Check out successful.",
      attendance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


export const getMyAttendanceHistory = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { range = "1w" } = req.query;

    const { startDate, endDate } = getDateRange(range);

    const attendanceHistory = await Attendance.find({
      employee: employeeId,
      dateAD: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ dateAD: -1 })
      .populate(
        "employee",
        "employeeId fullName email department designation"
      );

    return res.status(200).json({
      success: true,
      range,
      count: attendanceHistory.length,
      attendanceHistory,
    });
  } catch (error) {
    console.error("Get Attendance History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      dateAD: today,
    })
      .populate(
        "employee",
        "employeeId fullName email department designation"
      )
      .sort({ checkIn: 1 });

    return res.status(200).json({
      success: true,
      count: attendance.length,
      attendance,
    });
  } catch (error) {
    console.error("Get Today Attendance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getEmployeeAttendanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { range = "1w" } = req.query;

    const { startDate, endDate } = getDateRange(range);

    const attendanceHistory = await Attendance.find({
      employee: employeeId,
      dateAD: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate(
        "employee",
        "employeeId fullName email department designation"
      )
      .sort({ dateAD: -1 });

    return res.status(200).json({
      success: true,
      range,
      count: attendanceHistory.length,
      attendanceHistory,
    });
  } catch (error) {
    console.error("Get Employee Attendance History Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getMyAttendanceSummary = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { month = "2026-08" } = req.query;

    const [year, monthNumber] = month.split("-").map(Number);

    const startDate = new Date(year, monthNumber - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(year, monthNumber, 0);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employee: employeeId,
      dateAD: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const present = attendance.filter(
      (item) => item.status === "Present"
    ).length;

    const late = attendance.filter(
      (item) => item.isLate === true
    ).length;

    /*
      IMPORTANT:
      Absent tabhi calculate kar sakte hain jab tumhare DB
      mein absent attendance records create hote hain.
    */
    const absent = attendance.filter(
      (item) => item.status === "Absent"
    ).length;

    const workingDays = attendance.length;

    const attendancePercentage =
      workingDays > 0
        ? Math.round((present / workingDays) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      month,
      summary: {
        present,
        absent,
        late,
        workingDays,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Get My Attendance Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



export const markAbsentEmployees = async () => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const users = await User.find({
      status: "active",
      isDeleted : false
    });

    console.log("🔥 USERS LENGTH:", users.length);
    console.log("🔥 USERS:", users);

    for (const user of users) {
      console.log("🔄 PROCESSING USER:", user._id);

      const existingAttendance = await Attendance.findOne({
        employee: user._id,
        dateAD: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

      console.log("📋 EXISTING ATTENDANCE:", existingAttendance);

      if (!existingAttendance) {
        const created = await Attendance.create({
          employee: user._id,
          dateAD: startOfDay,
          dateBS: nepaliDate(startOfDay),
          status: "Absent",
          checkIn: null,
          checkOut: null,
          workingHours: 0,
          overtime: 0,
        });

        console.log("✅ CREATED:", created._id);
      } else {
        console.log("ℹ️ ALREADY EXISTS:", user._id);
      }
    }

    console.log("Absent employees marked successfully");

    return {
      success: true,
      message: "Absent employees marked successfully",
    };

  } catch (error) {
    console.error("Mark Absent Error:", error);

    return {
      success: false,
      message: error.message,
    };
  }
};


export const markAbsentEmployeesController = async (req, res) => {
  try {
    const result = await markAbsentEmployees();

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
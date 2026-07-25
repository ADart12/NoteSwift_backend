import User from "../models/usersModel.js";
import Attendance from "../models/attendanceModel.js";
import { nepaliDate } from "../utils/dateUtils.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const todayBS = nepaliDate();

    const [ totalEmployees, presentToday,] = await Promise.all([
      User.countDocuments({
        role: { $in: ["employee", "hr"] },
        status: "active",
      }),

      Attendance.countDocuments({
        dateBS: todayBS,
      }),
    ]);

    // Replace these according to your schema
    const lateToday = 0;
    const onLeave = 0;

    const absentToday =
      totalEmployees - presentToday - onLeave;

    const attendancePercentage =
      totalEmployees > 0
        ? Number(
            ((presentToday / totalEmployees) * 100).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        presentToday,
        absentToday,
        lateToday,
        onLeave,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
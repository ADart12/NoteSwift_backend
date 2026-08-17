import User from "../models/usersModel.js";
import Attendance from "../models/attendanceModel.js";
import { getDateRange } from "../utils/dateUtils.js";
import { nepaliDate } from "../utils/dateUtils.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const todayBS = nepaliDate();

    const [totalEmployees, presentToday,] = await Promise.all([
      User.countDocuments({
        role: { $in: ["employee", "hr", "admin"] },
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



export const getAttendanceOverview = async (req, res) => {
  try {
    const { range = "10d" } = req.query;

    const { startDate, endDate } = getDateRange(range);

    const overview = await Attendance.aggregate([
      {
        $match: {
          dateAD: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      {
        $group: {
          _id: "$dateAD",

          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },

          late: {
            $sum: {
              $cond: [{ $eq: ["$status", "Late"] }, 1, 0],
            },
          },

          leave: {
            $sum: {
              $cond: [{ $eq: ["$status", "Leave"] }, 1, 0],
            },
          },

          absent: {
            $sum: {
              $cond: [{ $eq: ["$status", "Absent"] }, 1, 0],
            },
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const formattedOverview = overview.map((item) => ({
      date: item._id.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),

      present: item.present,
      late: item.late,
      leave: item.leave,
      absent: item.absent,
    }));

    return res.status(200).json({
      success: true,
      overview: formattedOverview,
    });
  } catch (error) {
    console.error("Attendance Overview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
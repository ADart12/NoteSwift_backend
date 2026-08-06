import Leave from "../models/leaveModel.js";

export const applyLeave = async (req, res) => {
    try {
        const employee = req.user.id;

        const { leaveType, fromDate, toDate, reason } = req.body;

        // Validate required fields
        if (!leaveType || !fromDate || !toDate || !reason) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);

        // Validate dates
        if (start > end) {
            return res.status(400).json({
                success: false,
                message: "From date cannot be after To date.",
            });
        }

        // Calculate leave days (inclusive)
        const days =
            Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check overlapping leave
        const existingLeave = await Leave.findOne({
            employee,
            status: { $in: ["Pending", "Approved"] },
            fromDate: { $lte: end },
            toDate: { $gte: start },
        });

        if (existingLeave) {
            return res.status(400).json({
                success: false,
                message: "You already have a leave request for the selected dates.",
            });
        }

        const leave = await Leave.create({
            employee,
            leaveType,
            fromDate: start,
            toDate: end,
            days,
            reason,
        });

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully.",
            leave,
        });
    } catch (error) {
        console.error("Apply Leave Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};



export const getMyLeaves = async (req, res) => {
    try {
        const employee = req.user.id;

        const leaves = await Leave.find({ employee })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: leaves.length,
            leaves,
        });
    } catch (error) {
        console.error("Get My Leaves Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};



export const getMyLeaveById = async (req, res) => {
    try {
        const employee = req.user.id;
        const { id } = req.params;

        const leave = await Leave.findOne({
            _id: id,
            employee,
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            leave,
        });
    } catch (error) {
        console.error("Get My Leave By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};



export const deleteLeave = async (req, res) => {
    try {
        const employee = req.user.id;
        const { id } = req.params;

        const leave = await Leave.findOne({
            _id: id,
            employee,
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending leave requests can be deleted.",
            });
        }

        await Leave.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Leave request deleted successfully.",
        });
    } catch (error) {
        console.error("Delete Leave Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};




export const getAllLeaves = async (req, res) => {
    try {
        const { status = "all" } = req.query;

        const filter = {};

        if (status !== "all") {
            filter.status = status;
        }

        const leaves = await Leave.find(filter)
            .populate(
                "employee",
                "employeeId fullName email department designation"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: leaves.length,
            leaves,
        });
    } catch (error) {
        console.error("Get All Leaves Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};




export const getLeaveById = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findById(id).populate(
            "employee",
            "employeeId fullName email department designation"
        );

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        return res.status(200).json({
            success: true,
            leave,
        });
    } catch (error) {
        console.error("Get Leave By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};



export const rejectLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: `Leave request is already ${leave.status.toLowerCase()}.`,
            });
        }

        leave.status = "Rejected";
        leave.approvedBy = req.user.id;
        leave.approvedAt = new Date();

        if (remarks) {
            leave.remarks = remarks;
        }

        await leave.save();

        return res.status(200).json({
            success: true,
            message: "Leave rejected successfully.",
            leave,
        });
    } catch (error) {
        console.error("Reject Leave Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};



export const approveLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const { remarks } = req.body;

        const leave = await Leave.findById(id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found.",
            });
        }

        if (leave.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: `Leave has already been ${leave.status.toLowerCase()}.`,
            });
        }

        leave.status = "Approved";
        leave.approvedBy = req.user._id; // or req.user.id depending on your protect middleware
        leave.approvedAt = new Date();
        leave.remarks = remarks || "";

        await leave.save();

        const updatedLeave = await Leave.findById(leave._id)
            .populate(
                "employee",
                "employeeId fullName email department designation"
            )
            .populate(
                "approvedBy",
                "employeeId fullName role"
            );

        return res.status(200).json({
            success: true,
            message: "Leave approved successfully.",
            leave: updatedLeave,
        });
    } catch (error) {
        console.error("Approve Leave Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error.",
        });
    }
};



export const getLeaveSummary = async (req, res) => {
  try {
    const leaves = await Leave.find();

    const summary = {
      total: leaves.length,

      // Status
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,

      // Leave Types
      casual: 0,
      sick: 0,
      annual: 0,
      maternity: 0,
      paternity: 0,
      unpaid: 0,
      other: 0,
    };

    leaves.forEach((leave) => {
      // Status counts
      switch (leave.status) {
        case "Pending":
          summary.pending++;
          break;
        case "Approved":
          summary.approved++;
          break;
        case "Rejected":
          summary.rejected++;
          break;
        case "Cancelled":
          summary.cancelled++;
          break;
      }

      // Leave type counts
      switch (leave.leaveType) {
        case "Casual":
          summary.casual++;
          break;
        case "Sick":
          summary.sick++;
          break;
        case "Annual":
          summary.annual++;
          break;
        case "Maternity":
          summary.maternity++;
          break;
        case "Paternity":
          summary.paternity++;
          break;
        case "Unpaid":
          summary.unpaid++;
          break;
        case "Other":
          summary.other++;
          break;
      }
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave summary",
    });
  }
};
import crypto from "crypto";
import Invitation from "../models/invitationModel.js";
import Department from "../models/DepartmentModel.js";
import User from "../models/usersModel.js";
import { generateEmployeeId } from "../utils/generateEmployeeId.js"
import { resend } from "../cofig/resend.js";




export const sendInvitation = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      departmentId,
      designation,
      role,
    } = req.body;

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "Employee already exists.",
      });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({
      email,
      used: false,
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        message: "Invitation already sent.",
      });
    }

    console.log(departmentId)

    // Find department
    const departmentData = await Department.findOne({
      _id: departmentId,
      status: "Active",
    });


    if (!departmentData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive department.",
      });
    }


    const employeeId = await generateEmployeeId(
      departmentData.name,
      departmentData.code
    );

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Save invitation
    await Invitation.create({
      employeeId: employeeId,
      fullName,
      email,
      phone,

      // Store Department ObjectId
      department: departmentData._id,
      
      designation,
      role,
      token,
      invitedBy: req.user._id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Registration link
    const invitationLink =
      `${process.env.CLIENT_URL}/register?token=${token}`;

    // Send email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "You're invited",
      html: `
        <h2>Welcome!</h2>
        <p>You have been invited to join the Employee Management System.</p>
        <p>NoteSwift P.V.T</P>

        <a href="${invitationLink}">
          Complete Registration
        </a>

        <p>This link expires in 24 hours.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Invitation sent successfully.",
      token,
      invitationLink
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const validateInvitation = async (req, res) => {
  try {
    const { token } = req.query;

    const invitation = await Invitation.findOne({
      token,
      used: false,
    }).populate("department", "name code");

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation.",
      });
    }

    if (invitation.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invitation has expired.",
      });
    }

    return res.status(200).json({
      success: true,

      employeeId: invitation.employeeId,
      fullName: invitation.fullName,
      email: invitation.email,
      phone: invitation.phone,

      department: invitation.department,

      designation: invitation.designation,
      role: invitation.role,
    });

  } catch (error) {
    console.error("Validate invitation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
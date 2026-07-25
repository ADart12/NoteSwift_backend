import crypto from "crypto";
import Invitation from "../models/invitationModel.js";
import User from "../models/usersModel.js";
// import { resend } from "../config/resend.js"; 

export const sendInvitation = async (req, res) => {
    try {
        const {
            employeeId,
            fullName,
            email,
            phone,
            department,
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

        // Generate token
        const token = crypto.randomBytes(32).toString("hex");

        // Save invitation
        await Invitation.create({
            employeeId,
            fullName,
            email,
            phone,
            department,
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
    //     await resend.emails.send({
    //         from: process.env.RESEND_FROM_EMAIL,
    //         to: email,
    //         subject: "You're invited",
    //         html: `
    //     <h2>Welcome!</h2>
    //     <p>You have been invited to join the Attendance Management System.</p>

        // <a href="${invitationLink}">
    //       Complete Registration
    //     </a>

    //     <p>This link expires in 24 hours.</p>
    //   `,
    //     });

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
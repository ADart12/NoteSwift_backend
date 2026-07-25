import bcrypt from "bcryptjs";
import User from "../models/usersModel.js";
import generateToken from '../utils/generateToken.js';
import Invitation from "../models/invitationModel.js";


export const register = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        // Validate input
        if (!token || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        // Check password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match.",
            });
        }

        // Find invitation
        const invitation = await Invitation.findOne({ token });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invalid invitation link.",
            });
        }

        // Check if already used
        if (invitation.used) {
            return res.status(400).json({
                success: false,
                message: "Invitation has already been used.",
            });
        }

        // Check expiration
        if (new Date() > invitation.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "Invitation has expired.",
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            email: invitation.email,
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            employeeId: invitation.employeeId,
            fullName: invitation.fullName,
            email: invitation.email,
            phone: invitation.phone,
            department: invitation.department,
            designation: invitation.designation,
            role: invitation.role,
            password: hashedPassword,
        });

        // Mark invitation as used
        invitation.used = true;
        await invitation.save();

        // Optional: generate login token immediately
        const tokenJwt = generateToken(user._id);

        res.cookie("token", tokenJwt, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            user: {
                id: user._id,
                employeeId: user.employeeId,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error while registering user.",
        });
    }
};

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({
            email,
            isDeleted: false,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        if (user.status === "inactive") {
            return res.status(403).json({ 
                success : false,
                message: "Account is inactive" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        const token = generateToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login Successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                firstLogin: user.firstLogin,
                token: token
            },
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message,
        });

    }

};


export const logout = (req, res) => {

    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.json({
        success: true,
        message: "Logged out successfully",
    });

};


export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};
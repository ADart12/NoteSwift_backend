import jwt from "jsonwebtoken";
import User from "../models/usersModel.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    req.user = await User.findById(decoded.id)
      .select("-password")
      .populate("department", "name code");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    next();

  } catch (err) {
    console.log(err.message);

    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default protect;
export const authorizeDepartment = (department) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Admin can access every department
    if (req.user.role === "admin") {
      return next();
    }

    const userDepartment = req.user.department?.code;

    if (!userDepartment) {
      return res.status(403).json({
        success: false,
        message: "Department not assigned",
      });
    }

    if (userDepartment !== department) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this department",
      });
    }

    next();
  };
};
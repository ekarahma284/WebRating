import ROLES, { ALL_ROLES } from "../constants/roles.js";

export const roleMiddleware = (...allowedRoles) => {
  // Validate that all provided roles are valid
  const invalidRoles = allowedRoles.filter((role) => !ALL_ROLES.includes(role));
  if (invalidRoles.length > 0) {
    console.error(
      `Invalid roles provided to roleMiddleware: ${invalidRoles.join(", ")}`
    );
  }

  return (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          message: "Unauthorized: User not authenticated",
        });
      }

      // cek role user
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          message: "Forbidden: You do not have permission",
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
};

// Re-export ROLES for convenience
export { ROLES };

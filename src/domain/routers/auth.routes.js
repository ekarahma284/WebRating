import express from "express";
import AuthController from "../../controllers/AuthController.js"
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Login untuk semua role
router.post("/login", AuthController.login);

// Reset password → butuh token
router.post("/reset-password", authMiddleware.verify, AuthController.resetPassword);

// Lupa password (identifier username)
router.post("/forgot-password", AuthController.forgotPassword);

// Logout (invalidate token)
router.post("/logout", AuthController.logout);

export default router;

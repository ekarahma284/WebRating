import express from "express";
import UserController from "../../controllers/UserController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// GET user by ID
router.get("/:id", authMiddleware.verify, roleMiddleware("admin"), UserController.getUserById);

// GET ALL USERS
router.get("/", authMiddleware.verify, roleMiddleware("admin"), UserController.getAllUsers);
// GET USER BY ID (di bawah)
router.get("/:id", authMiddleware.verify, roleMiddleware("admin"), UserController.getUserById);
// CREATE user
router.post("/", authMiddleware.verify, roleMiddleware("admin"), UserController.createUser);

// UPDATE user
router.put("/:id", authMiddleware.verify, roleMiddleware("admin"), UserController.updateUser);

// DELETE user
router.delete("/:id", authMiddleware.verify, roleMiddleware("admin"), UserController.deleteUser);

export default router;

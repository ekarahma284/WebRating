import express from "express";
import UserController from "../../controllers/UserController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// GET user by ID
router.get(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  UserController.getUserById
);

// GET ALL USERS
router.get(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  UserController.getAllUsers
);
// GET USER BY ID (di bawah)
router.get(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  UserController.getUserById
);
// CREATE user
router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  UserController.createUser
);

// UPDATE user
router.put(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN, ROLES.PENGELOLA, ROLES.REVIEWER),
  UserController.updateUser
);

// DELETE user
router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  UserController.deleteUser
);

export default router;

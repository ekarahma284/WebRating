import express from "express";
import UserController from "../../controllers/UserController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// GET ALL USERS
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    UserController.getAll
);

// GET USER BY ID
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    UserController.getById
);

// CREATE USER
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    UserController.create
);

// UPDATE USER
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    UserController.update
);

// DELETE USER
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    UserController.remove
);

export default router;

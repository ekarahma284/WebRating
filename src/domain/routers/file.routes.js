import express from "express";
import FileController from "../../controllers/FileController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// UPLOAD FILE (admin & pengelola)
router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware("admin", "pengelola"),
  FileController.upload
);

// GET FILE BY ID (semua user login)
router.get(
  "/:id",
  authMiddleware.verify,
  FileController.getFile
);

// DELETE FILE (admin only)
router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware("admin"),
  FileController.delete
);

export default router;

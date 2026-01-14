import express from "express";
import FileController from "../../controllers/FileController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";
import upload from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

// ===============================
// 📌 UPLOAD FILE (admin & pengelola)
// ===============================

// Middleware untuk handle error multer agar tetap JSON
const uploadHandler = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN, ROLES.REVIEWER, ROLES.PENGELOLA),
  uploadHandler,
  FileController.createFile
);

// ===============================
// 📌 GET FILE BY ID (semua user login)
// ===============================
router.get(
  "/:id",
  authMiddleware.verify,
  FileController.getFileById
);

// ===============================
// 📌 DELETE FILE (admin only)
// ===============================
router.delete(
  "/:id",
  authMiddleware.verify,
  roleMiddleware(ROLES.ADMIN),
  FileController.deleteFile
);

export default router;

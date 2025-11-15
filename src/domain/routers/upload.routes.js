import { Router } from "express";
import UploadController from "../../controllers/UploadController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ROUTES
router.post("/", authMiddleware.verify, upload.single("file"), UploadController.upload);
router.get("/:id", authMiddleware.verify, UploadController.getFile);
router.delete("/:id", authMiddleware.verify, UploadController.delete);

export default router;

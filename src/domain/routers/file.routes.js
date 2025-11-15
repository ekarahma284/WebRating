import { Router } from "express";
import FileController from "../../controllers/FileController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware.verify, FileController.upload);
router.get("/:id", authMiddleware.verify, FileController.getFile);
router.delete("/:id", authMiddleware.verify, FileController.delete);

export default router;

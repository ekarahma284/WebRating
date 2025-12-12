import { Router } from "express";
import AccountRequestController from "../../controllers/AccountRequestController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";
import upload, { handleUploadErrors } from "../../middlewares/uploadMiddleware.js";

const router = Router();

// ROUTES
// create
router.post(
    "/",
    upload.fields([
        { name: "upload_cv", maxCount: 1 },
        { name: "upload_surat_kuasa", maxCount: 1 }
    ]),
    handleUploadErrors,
    AccountRequestController.create
);

// list (admin only)
router.get("/", authMiddleware.verify, roleMiddleware("admin"), AccountRequestController.list);

// detail
router.get("/:id", authMiddleware.verify, roleMiddleware("admin"), AccountRequestController.getById);

// accept
router.post("/:id/accept", authMiddleware.verify, roleMiddleware("admin"), AccountRequestController.accept);

// reject
router.post("/:id/reject", authMiddleware.verify, roleMiddleware("admin"), AccountRequestController.reject);

export default router;
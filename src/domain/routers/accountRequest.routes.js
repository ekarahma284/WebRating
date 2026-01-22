import { Router } from "express";
import AccountRequestController from "../../controllers/AccountRequestController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";
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
router.get("/", authMiddleware.verify, roleMiddleware(ROLES.ADMIN), AccountRequestController.list);

// detail
router.get("/:id", authMiddleware.verify, roleMiddleware(ROLES.ADMIN), AccountRequestController.getById);

// accept
router.post("/:id/accept", authMiddleware.verify, roleMiddleware(ROLES.ADMIN), AccountRequestController.accept);

// reject
router.delete("/:id/reject", authMiddleware.verify, roleMiddleware(ROLES.ADMIN), AccountRequestController.reject);

export default router;
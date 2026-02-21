import express from "express";
import AppSettingsController from "../../controllers/AppSettingsController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", AppSettingsController.get);
router.put("/", authMiddleware.verify, roleMiddleware(ROLES.ADMIN), AppSettingsController.update);

export default router;

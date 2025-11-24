// src/domain/routers/accountRequest.routes.js
import express from "express";
import AccountRequestController from "../controllers/AccountRequestController.js";
import authMiddleware, { roleMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();
const controller = new AccountRequestController();

// Semua route yang sebelumnya pakai class sekarang cukup pakai function
router.get("/", authMiddleware, controller.getAll.bind(controller));
router.post("/", authMiddleware, roleMiddleware("admin"), controller.create.bind(controller));
router.patch("/:id", authMiddleware, roleMiddleware("admin"), controller.update.bind(controller));
router.delete("/:id", authMiddleware, roleMiddleware("admin"), controller.delete.bind(controller));

export default router;

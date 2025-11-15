import { Router } from "express";
import SchoolController from "../../controllers/SchoolController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = Router();

// PUBLIC
router.get("/", SchoolController.list);
router.get("/:id", SchoolController.getById);

// ADMIN & PENGELOLA
router.post("/", authMiddleware, roleMiddleware("admin"), SchoolController.create);
router.put("/:id", authMiddleware, roleMiddleware("admin", "pengelola"), SchoolController.update);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), SchoolController.remove);

// CLAIM SCHOOL
router.post("/:id/claim", authMiddleware, roleMiddleware("pengelola"), SchoolController.claim);

export default router;

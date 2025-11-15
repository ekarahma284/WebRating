import { Router } from "express";
import ReviewController from "../../controllers/RiviewController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware } from "../../middlewares/roleMiddleware.js";

const router = Router();
const controller = new ReviewController();

// REVIEW UTAMA
router.post("/", authMiddleware, roleMiddleware("reviewer"), controller.createReview.bind(controller));
router.get("/school/:school_id", controller.getReviewBySchool.bind(controller));
router.get("/reviewer/:reviewer_id", controller.getReviewByReviewer.bind(controller));
router.get("/:id", controller.getOneReview.bind(controller));

// REVIEW ITEMS
router.post("/:review_id/items", authMiddleware, roleMiddleware("reviewer"), controller.addReviewItem.bind(controller));

// RESPONSES / CHAT
router.post("/:review_id/responses", authMiddleware, controller.addResponse.bind(controller));
router.get("/:review_id/responses", authMiddleware, controller.getResponses.bind(controller));

export default router;

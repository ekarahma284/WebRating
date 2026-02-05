import express from "express";
import ReviewController from "../../controllers/RiviewController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import { roleMiddleware, ROLES } from "../../middlewares/roleMiddleware.js";

const router = express.Router();

// ======================================================
// REVIEW UTAMA
// ======================================================

// Get list reviews based on user role (reviewer, pengelola, admin)
router.get(
  "/",
  authMiddleware.verify,
  ReviewController.getListReviews
);

// Create review baru (khusus reviewer)
router.post(
  "/",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER),
  ReviewController.createReview
);

// Ambil Detail Review berdasarkan school_id
router.get(
  "/school/:school_id",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER, ROLES.PENGELOLA),
  ReviewController.getReviewDetailBySchoolId
);

// Ambil detail satu review
router.get("/:id", authMiddleware.verify, ReviewController.getOneReview);

// ======================================================
// REVIEW ITEMS
// ======================================================

router.post(
  "/:review_id/items",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER),
  ReviewController.addReviewItem
);

router.put(
  "/:review_id/items/:reviewItem_id",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER),
  ReviewController.editReviewItem
);

// ======================================================
// RESPONSES (CHAT ANTARA REVIEWER & PENGELOLA SEKOLAH)
// ======================================================

// Tambah response
router.post(
  "/:review_id/responses",
  authMiddleware.verify,
  ReviewController.addResponse
);

// Ambil semua response untuk satu review
router.get(
  "/:review_id/responses",
  authMiddleware.verify,
  ReviewController.getResponses
);
// ======================================================
// REVIEWER DASHBOARD
// ======================================================
router.get(
  "/ranking/schools",
  ReviewController.getSchoolRankingTop3
);

router.get(
  "/ranking/schools/level",
  ReviewController.getSchoolRankingByLevel
)

router.get(
  "/dashboard/stats",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER),
  ReviewController.getReviewStats
);

router.get(
  "/dashboard/scores",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER),
  ReviewController.getSchoolScores
);

router.get(
  "/dashboard/profile",
  authMiddleware.verify,
  roleMiddleware(ROLES.REVIEWER),
  ReviewController.getMyProfile
);


export default router;
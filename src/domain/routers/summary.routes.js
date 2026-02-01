import express from "express";
import SummaryController from "../../controllers/SummaryController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

// GET summary data (authenticated - returns different data based on role)
router.get("/", authMiddleware.verify, SummaryController.getSummary);

export default router;

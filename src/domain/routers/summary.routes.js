import express from "express";
import SummaryController from "../../controllers/SummaryController.js";

const router = express.Router();

// GET summary data (no auth required)
router.get("/", SummaryController.getSummary);

export default router;

import express from "express";

const router = express.Router();

// contoh route awal saja
router.get("/test", (req, res) => {
  res.json({ message: "Router bekerja!" });
});

export default router;

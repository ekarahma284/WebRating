import cors from "cors";
import express from "express";
import dsn from "./src/Infra/postgres.js";
import router from "./src/domain/router.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register seluruh route dengan prefix /api
app.use("/api", router);

// Health check
app.get("/", async (req, res) => {
  try {
    const result = await dsn`SELECT NOW()`;
    res.json({
      message: "✅ Server berjalan dan terkoneksi ke PostgreSQL",
      time: result[0]?.now || "Unknown",
    });
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
    res.status(500).json({
      message: "Gagal konek ke database",
      details: error.message,
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    details: err.message,
  });
});

// Run server
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Server shutting down...");
  process.exit(0);
});

export default app;

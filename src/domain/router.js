import { Router } from "express";

import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/user.routes.js";
import accountRequestRoutes from "./routers/accountRequest.routes.js";
import schoolRoutes from "./routers/school.routes.js";
import indicatorRoutes from "./routers/indicator.routes.js";
import riviewRoutes from "./routers/riview.routes.js";
import fileRoutes from "./routers/file.routes.js";
import notificationRoutes from "./routers/notification.routes.js";
import uploadRoutes from "./routers/upload.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/requests", accountRequestRoutes);
router.use("/schools", schoolRoutes);
router.use("/indicators", indicatorRoutes);
router.use("/reviews", riviewRoutes);
router.use("/files", fileRoutes);
router.use("/notifications", notificationRoutes);
router.use("/uploads", uploadRoutes);
router.use("/sse", (await import("./routers/sse.js")).default);

export default router;
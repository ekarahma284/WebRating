import express from "express";
import authMiddleware from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Menyimpan semua client SSE
let clients = [];

/* ============================================
   COMMENTS STREAM
   ============================================ */
router.get("/comments/stream/:review_id", async (req, res) => {
    const { review_id } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const client = {
        id: Date.now(),
        type: "comment",
        res,
        review_id
    };

    clients.push(client);
    console.log("Client connected (comment):", client.id);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== client.id);
        console.log("Client disconnected (comment):", client.id);
    });
});

// Fungsi push COMMENT
export function broadcastNewComment(comment) {
    clients.forEach(client => {
        if (client.type === "comment" && client.review_id == comment.review_id) {
            client.res.write(`data: ${JSON.stringify(comment)}\n\n`);
        }
    });
}


/* ============================================
   NOTIFICATION STREAM
   ============================================ */
router.get("/notifications/stream/", authMiddleware.verify, async (req, res) => {
    // const { user_id } = req.params;
    const user_id = req.user.id;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const client = {
        id: Date.now(),
        type: "notification",
        res,
        user_id
    };

    clients.push(client);
    console.log("Client connected (notification):", client.id);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== client.id);
        console.log("Client disconnected (notification):", client.id);
    });
});

// Fungsi push NOTIFICATION
export function broadcastNewNotification(notification) {
    clients.forEach(client => {
        if (client.type === "notification" && client.user_id == notification.user_id) {
            client.res.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
    });
}

export default router;

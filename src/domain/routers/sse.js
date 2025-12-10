import express from "express";

const router = express.Router();

// Menyimpan semua client yang subscribe
let clients = [];

router.get("/comments/stream/:review_id", async (req, res) => {
    const { review_id } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Daftarkan client SSE
    const client = { id: Date.now(), res, review_id };
    clients.push(client);

    console.log("Client connected:", client.id);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== client.id);
        console.log("Client disconnected:", client.id);
    });
});

// Fungsi untuk push event ke client
export function broadcastNewComment(comment) {
    clients.forEach(client => {
        if (client.review_id == comment.review_id) {
            client.res.write(`data: ${JSON.stringify(comment)}\n\n`);
        }
    });
}

export default router;

import jwt from "jsonwebtoken";
import { error } from "../utils/response.js";

class authMiddleware {
    static verify(req, res, next) {
        try {
            const header = req.headers.authorization;

            if (!header || !header.startsWith("Bearer ")) {
                return error(res, "Token tidak ditemukan", 401);
            }

            const token = header.split(" ")[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Simpan payload token di req.user
            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            };

            next();
        } catch (err) {
            return error(
                res,
                "Token tidak valid atau telah kedaluwarsa",
                401,
                err.message
            );
        }
    }
}

// Export default agar bisa di-import tanpa {}
export default authMiddleware;

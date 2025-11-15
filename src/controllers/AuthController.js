// controllers/AuthController.js
import AuthService from "../services/AuthService.js";
import { success, error } from "../utils/response.js";

class AuthController {

    async login(req, res) {
        try {
            const { identifier, password } = req.body;

            if (!identifier || !password) {
                return error(res, "Identifier & Password wajib diisi", 400);
            }

            /**
             * identifier:
             * - admin → username
             * - reviewer → email
             * - pengelola → NPSN
             */

            const result = await AuthService.login(identifier, password);

            return success(res, "Login berhasil", result);
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    async resetPassword(req, res) {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            const userId = req.user?.id;

            if (!userId) return error(res, "User tidak ditemukan di token", 401);

            const updated = await AuthService.resetPassword(
                userId,
                oldPassword,
                newPassword,
                confirmPassword
            );

            return success(res, "Password berhasil diubah", updated);
        } catch (err) {
            return error(res, err.message, 400);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { username } = req.body;

            if (!username) return error(res, "Username wajib diisi", 400);

            const result = await AuthService.forgotPassword(username);

            return success(res, "Permintaan reset password diproses", result);
        } catch (err) {
            return error(res, err.message, 400);
        }
    }
}

export default new AuthController();

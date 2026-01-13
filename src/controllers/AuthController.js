import AuthService from "../services/AuthService.js";

export default class AuthController {

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await AuthService.login(username, password);

            return res.json({
                success: true,
                message: "Login success",
                token: result.token,
                user: result.user
            });

        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Username atau password salah"
            });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { newPassword } = req.body;
            const userId = req.user.id; // hasil dari middleware

            await AuthService.resetPassword(userId, newPassword);

            return res.json({ success: true, message: "Password updated" });

        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Reset failed",
            });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { username, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password salah, silahkan dicoba lagi"
                });
            }

            await AuthService.forgotPassword(username, confirmPassword);

            return res.json({ success: true, message: "Password berhasil dirubah" });

        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Forgot password failed"
            });
        }
    }

    static async logout(req, res) {
        try {
            const header = req.headers.authorization;

            if (!header || !header.startsWith("Bearer ")) {
                return res.status(400).json({
                    success: false,
                    message: "Token tidak ditemukan"
                });
            }

            const token = header.split(" ")[1];
            await AuthService.logout(token);

            return res.json({
                success: true,
                message: "Logout berhasil"
            });

        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Logout failed"
            });
        }
    }
}

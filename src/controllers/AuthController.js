import AuthService from "../services/AuthService.js";
import bcrypt from "bcrypt";
import UserService from "../services/UserService.js";

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
                message: err.message || "Login failed"
            });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { newPassword } = req.body;
            const userId = req.user.id; // hasil dari middleware

            const result = await AuthService.resetPassword(userId, newPassword);

            return res.json({ success: true, message: "Password updated" });

        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Reset failed"
            });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { username } = req.body;

            await AuthService.forgotPassword(username);

            return res.json({ success: true, message: "Password reset link sent" });

        } catch (err) {
            return res.status(err.status || 500).json({
                success: false,
                message: err.message || "Forgot password failed"
            });
        }
    }
}

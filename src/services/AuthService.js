import userModel from "../models/userModel.js";
import { comparePassword } from "../utils/password.js";
import jwt from "jsonwebtoken";

export default class AuthService {
    static async login(username, password) {
        if (!username || !password) {
            throw { status: 400, errors: "Username and Password cannot be empty" };
        }

        const user = await userModel.findByUsername(username);
        if (!user) {
            throw { status: 404, errors: "User not found!" };
        }

        const match = await comparePassword(password, user.password_hash);
        if (!match) {
            throw { status: 400, errors: "Password wrong!" };
        }

        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        return {
            token,
            user: {
                username: user.username,
                role: user.role,
            }
        };
    }

     static async resetPassword(userId, newPassword) {
        if (!newPassword) {
            const err = new Error("Password baru wajib diisi");
            err.status = 400;
            throw err;
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        return { success: true };
    }

    static async forgotPassword(username) {
        // nanti bisa kamu lengkapi
        return true;
    }
}

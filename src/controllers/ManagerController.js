import SchoolService from "../services/SchoolService.js";
import ReviewService from "../services/RiviewService.js";
import UserService from "../services/UserService.js";
import { success } from "../utils/response.js";

export default class ManagerController {

  static async getDashboardRating(req, res) {
    const schoolId = req.user.school_id;
    const data = await ReviewService.getSchoolRating(schoolId);
    return success(res, data);
  }

  static async getProfile(req, res) {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid parameter: userId is required" });
    }
    const data = await UserService.getManagerProfile(userId);
    return success(res, "Berhasil mengambil data profil", data);
  }

  static async updateSchoolProfile(req, res) {
    const userId = req.user.id;
    const result = await SchoolService.updateByManager(userId, req.body);
    return success(res, result);
  }
}

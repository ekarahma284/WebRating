import AppSettingsService from "../services/AppSettingsService.js";

export default class AppSettingsController {
  static async get(req, res) {
    try {
      const settings = await AppSettingsService.get();
      res.json({
        success: true,
        message: "App settings retrieved successfully",
        data: settings || {},
      });
    } catch (err) {
      AppSettingsController.handleError(res, err);
    }
  }

  static async update(req, res) {
    try {
      const settings = await AppSettingsService.update(req.body);
      res.json({
        success: true,
        message: "App settings updated successfully",
        data: settings,
      });
    } catch (err) {
      AppSettingsController.handleError(res, err);
    }
  }

  static handleError(res, err) {
    console.error("Controller Error:", err);
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      message: err.errors || err.message || "Internal server error",
    });
  }
}

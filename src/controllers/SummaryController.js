import SummaryService from "../services/SummaryService.js";

export default class SummaryController {

    static async getSummary(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;

            if (limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: "Limit must be between 1 and 100"
                });
            }

            const summary = await SummaryService.getSummary(req.user, limit);

            res.json({
                success: true,
                message: "Summary retrieved successfully",
                data: summary
            });
        } catch (err) {
            SummaryController.handleError(res, err);
        }
    }

    static handleError(res, err) {
        console.error("Controller Error:", err);

        const status = err.status || 500;

        res.status(status).json({
            success: false,
            message: err.errors || err.message || "Internal server error"
        });
    }

}

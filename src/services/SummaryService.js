import SummaryModel from "../models/SummaryModel.js";

export default class SummaryService {

    // ============================================
    // GET SUMMARY DATA
    // ============================================
    static async getSummary(limit = 100) {
        const stats = await SummaryModel.getStats();
        const topSchools = await SummaryModel.getTopRankedSchools(limit);

        return {
            total_schools: parseInt(stats.total_schools),
            total_account_requests: parseInt(stats.total_account_requests),
            total_reviewers: parseInt(stats.total_reviewers),
            top_ranked_schools: topSchools.map(school => ({
                ...school,
                average_score: parseFloat(school.average_score),
                review_count: parseInt(school.review_count)
            }))
        };
    }

}

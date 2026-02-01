import SummaryModel from "../models/SummaryModel.js";
import SchoolModel from "../models/SchoolModel.js";
import ROLES from "../constants/roles.js";

export default class SummaryService {

    // ============================================
    // GET SUMMARY DATA (role-based)
    // ============================================
    static async getSummary(user, limit = 100) {
        // Admin summary
        if (user.role === ROLES.ADMIN) {
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

        // Pengelola summary
        if (user.role === ROLES.PENGELOLA) {
            // Get pengelola's school
            const school = await SchoolModel.findByPengelolaId(user.id);

            if (!school) {
                throw { status: 404, errors: "School not found for this pengelola" };
            }

            // Get all pengelola-specific data
            const [rating, rankings, reviewerCount, reviews] = await Promise.all([
                SummaryModel.getSchoolRating(school.id),
                SummaryModel.getSchoolRankings(school.id),
                SummaryModel.getSchoolReviewerCount(school.id),
                SummaryModel.getSchoolReviews(school.id)
            ]);

            return {
                rating: {
                    average_score: parseFloat(rating?.average_score || 0),
                    review_count: parseInt(rating?.review_count || 0)
                },
                ranking_kecamatan: rankings.ranking_kecamatan,
                ranking_kabupaten: rankings.ranking_kabupaten,
                reviewer_count: reviewerCount,
                reviews: reviews.map(review => ({
                    ...review,
                    total_score: parseFloat(review.total_score),
                    items_count: parseInt(review.items_count)
                }))
            };
        }

        // Reviewer summary (basic stats)
        if (user.role === ROLES.REVIEWER) {
            const stats = await SummaryModel.getStats();

            return {
                total_schools: parseInt(stats.total_schools),
                total_reviewers: parseInt(stats.total_reviewers)
            };
        }

        throw { status: 403, errors: "Unauthorized role" };
    }

}

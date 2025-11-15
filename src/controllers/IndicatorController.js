// controllers/IndicatorController.js
import dsn from "../Infra/postgres.js";

export default class IndicatorController {

    /** ======================
     *  CATEGORY
     * ====================== */
    static async getCategories(req, res, next) {
        try {
            const rows = await dsn`SELECT * FROM indicator_categories ORDER BY id ASC`;
            return res.json({ data: rows });
        } catch (err) { next(err); }
    }

    static async createCategory(req, res, next) {
        try {
            const { name } = req.body;
            const rows = await dsn`
                INSERT INTO indicator_categories (name)
                VALUES (${name}) RETURNING *
            `;
            return res.status(201).json({ data: rows[0] });
        } catch (err) { next(err); }
    }

    static async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            await dsn`
                UPDATE indicator_categories
                SET name = COALESCE(${name}, name)
                WHERE id = ${id}
            `;

            return res.json({ message: "Category updated" });
        } catch (err) { next(err); }
    }

    static async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            await dsn`DELETE FROM indicator_categories WHERE id = ${id}`;
            return res.json({ message: "Category deleted" });
        } catch (err) { next(err); }
    }

    /** ======================
     *  INDICATORS
     * ====================== */
    static async getIndicators(req, res, next) {
        try {
            const rows = await dsn`
                SELECT i.*, c.name AS category_name
                FROM indicators i
                LEFT JOIN indicator_categories c ON c.id = i.category_id
                ORDER BY i.id ASC
            `;

            return res.json({ data: rows });
        } catch (err) { next(err); }
    }

    static async createIndicator(req, res, next) {
        try {
            const { category_id, name, description } = req.body;

            const rows = await dsn`
                INSERT INTO indicators (category_id, name, description)
                VALUES (${category_id}, ${name}, ${description})
                RETURNING *
            `;

            return res.status(201).json({ data: rows[0] });
        } catch (err) { next(err); }
    }

    static async updateIndicator(req, res, next) {
        try {
            const { id } = req.params;
            const { category_id, name, description } = req.body;

            await dsn`
                UPDATE indicators SET
                    category_id = COALESCE(${category_id}, category_id),
                    name = COALESCE(${name}, name),
                    description = COALESCE(${description}, description)
                WHERE id = ${id}
            `;

            return res.json({ message: "Indicator updated" });
        } catch (err) { next(err); }
    }

    static async deleteIndicator(req, res, next) {
        try {
            const { id } = req.params;
            await dsn`DELETE FROM indicators WHERE id = ${id}`;
            return res.json({ message: "Indicator deleted" });
        } catch (err) { next(err); }
    }
}

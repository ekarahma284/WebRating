// src/services/SchoolService.js
import dsn from "../Infra/postgres.js";

export default class SchoolService {
  static async create(payload) {
    const rows = await dsn`
      INSERT INTO schools (nama, npsn, alamat, deskripsi, telepon, email, website, jenjang, status_sekolah, foto)
      VALUES (${payload.nama}, ${payload.npsn}, ${payload.alamat}, ${payload.deskripsi}, ${payload.telepon}, ${payload.email}, ${payload.website}, ${payload.jenjang}, ${payload.status_sekolah}, ${payload.foto})
      RETURNING *
    `;
    return rows[0];
  }

  static async list() {
    return await dsn`SELECT * FROM schools ORDER BY created_at DESC`;
  }

  static async getById(id) {
    const rows = await dsn`SELECT * FROM schools WHERE id = ${id}`;
    return rows[0];
  }

  static async update(id, payload) {
    const rows = await dsn`
      UPDATE schools SET
        nama = COALESCE(${payload.nama}, nama),
        npsn = COALESCE(${payload.npsn}, npsn),
        alamat = COALESCE(${payload.alamat}, alamat),
        deskripsi = COALESCE(${payload.deskripsi}, deskripsi),
        telepon = COALESCE(${payload.telepon}, telepon),
        email = COALESCE(${payload.email}, email),
        website = COALESCE(${payload.website}, website),
        jenjang = COALESCE(${payload.jenjang}, jenjang),
        status_sekolah = COALESCE(${payload.status_sekolah}, status_sekolah),
        foto = COALESCE(${payload.foto}, foto)
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0];
  }

  // Admin confirms claim: set is_claimed true and claimed_by
  static async confirmClaim(schoolId, adminUserId, ownerUserId) {
    const rows = await dsn`UPDATE schools SET is_claimed = true, claimed_by = ${ownerUserId} WHERE id = ${schoolId} RETURNING *`;
    return rows[0];
  }

  // Get aggregated score and ranking helper
  static async computeSchoolScore(schoolId) {
    // Calculate average across reviews, optionally using indicator weights if available.
    // Strategy:
    // 1. get all review_items for reviews of the school join indicators (if weight exists)
    // 2. if indicators.weight exists, compute weighted average per review and then average those
    try {
      const items = await dsn`
        SELECT ri.*, i.judul, i.deskripsi, (SELECT column_name FROM information_schema.columns WHERE table_name='indicators' AND column_name='weight') as has_weight
        FROM review_items ri
        JOIN reviews r ON ri.review_id = r.id
        JOIN indicators i ON ri.indicator_id = i.id
        WHERE r.school_id = ${schoolId}
      `;
      if (!items || items.length === 0) return { score: 0, count: 0 };

      // check if indicators table has 'weight' column by querying sample
      const weightCheck = await dsn`
        SELECT 1 FROM information_schema.columns WHERE table_name='indicators' AND column_name='weight'
      `;
      const hasWeight = weightCheck && weightCheck.length > 0;

      if (!hasWeight) {
        // simple arithmetic: average of all item skor grouped by review
        const revs = await dsn`
          SELECT r.id, AVG(ri.skor) as avg_per_review
          FROM reviews r
          JOIN review_items ri ON ri.review_id = r.id
          WHERE r.school_id = ${schoolId}
          GROUP BY r.id
        `;
        const avgPerReviews = revs.map(r => Number(r.avg_per_review));
        const overall = avgPerReviews.reduce((a,b)=>a+b,0) / avgPerReviews.length;
        return { score: overall, count: avgPerReviews.length };
      } else {
        // weighted: compute per review weighted average
        const revIds = [...new Set(items.map(it=>it.review_id))];
        let sumRev = 0;
        for (const rid of revIds) {
          const rowItems = items.filter(it => it.review_id === rid);
          let numerator = 0;
          let denom = 0;
          for (const it of rowItems) {
            const weightRow = (await dsn`SELECT weight::numeric FROM indicators WHERE id = ${it.indicator_id}`)[0];
            const w = weightRow?.weight ? Number(weightRow.weight) : 1;
            numerator += Number(it.skor) * w;
            denom += w;
          }
          const avg = denom === 0 ? 0 : numerator / denom;
          sumRev += avg;
        }
        const overall = sumRev / revIds.length;
        return { score: overall, count: revIds.length };
      }
    } catch (err) {
      throw err;
    }
  }

  // get ranking across schools
  static async ranking(limit = 50) {
    // compute score for all schools (note: performance not optimal for many schools; can be optimized in SQL)
    const schools = await dsn`SELECT id, nama FROM schools`;
    const arr = [];
    for (const s of schools) {
      const sc = await this.computeSchoolScore(s.id);
      arr.push({ id: s.id, nama: s.nama, score: sc.score, reviews: sc.count });
    }
    arr.sort((a,b) => b.score - a.score);
    return arr.slice(0, limit);
  }
}

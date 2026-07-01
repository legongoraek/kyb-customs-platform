"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.satRepository = void 0;
const pool_1 = require("../../../db/pool");
const mapSatEntryRow = (row) => ({
    id: row.id,
    rfc: row.rfc,
    legalName: row.legal_name || undefined,
    source: row.source,
    listType: row.list_type,
    situation: row.situation || undefined,
    referenceUrl: row.reference_url,
    publishedAt: row.published_at || undefined,
    importedAt: row.imported_at,
    rawData: row.raw_data || {},
});
exports.satRepository = {
    async findEntriesByRfc(rfc) {
        const result = await pool_1.pool.query(`
      select *
      from sat_list_entries
      where rfc = $1
      order by imported_at desc
      `, [rfc.trim().toUpperCase()]);
        return result.rows.map(mapSatEntryRow);
    },
    async createSatListCheck(input) {
        const result = await pool_1.pool.query(`
      insert into sat_list_checks (
        case_id,
        rfc_searched,
        source,
        result,
        reference_url,
        raw_match
      )
      values ($1, $2, $3, $4, $5, $6)
      returning *
      `, [
            input.caseId,
            input.rfcSearched.trim().toUpperCase(),
            input.source,
            input.result,
            input.referenceUrl,
            JSON.stringify(input.rawMatch || {}),
        ]);
        return result.rows[0];
    },
    async findLatestChecksByCaseId(caseId) {
        const result = await pool_1.pool.query(`
      select distinct on (source)
        *
      from sat_list_checks
      where case_id = $1
      order by source, checked_at desc
      `, [caseId]);
        return result.rows.map((row) => ({
            ...row,
            rawMatch: row.raw_match ? JSON.parse(row.raw_match) : undefined,
        }));
    },
};

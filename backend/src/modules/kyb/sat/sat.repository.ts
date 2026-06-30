import { pool } from "../../../db/pool";

export type SatListEntry = {
  id: string;
  rfc: string;
  legalName?: string;
  source: string;
  listType: string;
  situation?: string;
  referenceUrl: string;
  publishedAt?: string;
  importedAt: string;
  rawData?: Record<string, unknown>;
};

const mapSatEntryRow = (row: any): SatListEntry => ({
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

export const satRepository = {
  async findEntriesByRfc(rfc: string) {
    const result = await pool.query(
      `
      select *
      from sat_list_entries
      where rfc = $1
      order by imported_at desc
      `,
      [rfc.trim().toUpperCase()]
    );

    return result.rows.map(mapSatEntryRow);
  },

  async createSatListCheck(input: {
    caseId: string;
    rfcSearched: string;
    source: string;
    result: string;
    referenceUrl: string;
    rawMatch?: Record<string, unknown>;
  }) {
    const result = await pool.query(
      `
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
      `,
      [
        input.caseId,
        input.rfcSearched.trim().toUpperCase(),
        input.source,
        input.result,
        input.referenceUrl,
        JSON.stringify(input.rawMatch || {}),
      ]
    );

    return result.rows[0];
  },

  async findLatestChecksByCaseId(caseId: string) {
    const result = await pool.query(
      `
      select distinct on (source)
        *
      from sat_list_checks
      where case_id = $1
      order by source, checked_at desc
      `,
      [caseId]
    );

    return result.rows;
  },
};
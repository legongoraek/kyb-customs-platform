import { pool } from "../../../db/pool";

export type SatImportEntry = {
  rfc: string;
  legalName?: string;
  source: string;
  listType: string;
  situation: string;
  referenceUrl: string;
  publishedAt?: string;
  rawData: Record<string, unknown>;
};

export const satImportRepository = {
  async createImportLog(input: {
    source: string;
    sourceName: string;
    sourceUrl: string;
    metadata?: Record<string, unknown>;
  }) {
    const result = await pool.query(
      `
      insert into sat_import_logs (
        source,
        source_name,
        source_url,
        status,
        metadata
      )
      values ($1, $2, $3, $4, $5)
      returning *
      `,
      [
        input.source,
        input.sourceName,
        input.sourceUrl,
        "running",
        JSON.stringify(input.metadata || {}),
      ]
    );

    return result.rows[0];
  },

  async finishImportLog(input: {
    id: string;
    status: "success" | "failed";
    importedCount: number;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
  }) {
    await pool.query(
      `
      update sat_import_logs
      set
        status = $1,
        imported_count = $2,
        error_message = $3,
        finished_at = now(),
        metadata = coalesce(metadata, '{}'::jsonb) || $4::jsonb
      where id = $5
      `,
      [
        input.status,
        input.importedCount,
        input.errorMessage || null,
        JSON.stringify(input.metadata || {}),
        input.id,
      ]
    );
  },

  async upsertSatEntry(entry: SatImportEntry) {
    await pool.query(
      `
      insert into sat_list_entries (
        rfc,
        legal_name,
        source,
        list_type,
        situation,
        reference_url,
        published_at,
        raw_data
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      on conflict (rfc, source, list_type)
      do update set
        legal_name = excluded.legal_name,
        situation = excluded.situation,
        reference_url = excluded.reference_url,
        published_at = excluded.published_at,
        raw_data = excluded.raw_data,
        imported_at = now()
      `,
      [
        entry.rfc,
        entry.legalName || null,
        entry.source,
        entry.listType,
        entry.situation,
        entry.referenceUrl,
        entry.publishedAt || null,
        JSON.stringify(entry.rawData),
      ]
    );
  },

  async findImportLogs(limit = 20) {
    const result = await pool.query(
      `
      select *
      from sat_import_logs
      order by started_at desc
      limit $1
      `,
      [limit]
    );

    return result.rows;
  },
};
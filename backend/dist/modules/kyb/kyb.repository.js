"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kybRepository = void 0;
const pool_1 = require("../../db/pool");
const mapKybCaseRow = (row) => ({
    id: row.id,
    status: row.status,
    decision: row.decision,
    score: row.score,
    canApprove: Boolean(row.can_approve),
    client: {
        rfc: row.rfc,
        legalName: row.legal_name,
        address: row.address,
        legalRepresentativeName: row.legal_representative_name,
        shareholders: row.shareholders || [],
        beneficialOwner: row.beneficial_owner || undefined,
    },
    documents: [],
    satListChecks: [],
    riskFactors: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});
const mapDocumentRow = (row) => ({
    id: row.id,
    caseId: row.case_id,
    type: row.type,
    status: row.status,
    issueDate: row.issue_date,
    expirationDate: row.expiration_date,
    extractedRfc: row.extracted_rfc,
    extractedLegalName: row.extracted_legal_name,
    extractedAddress: row.extracted_address,
    extractedRepresentative: row.extracted_representative,
    fileUrl: row.file_url,
    createdAt: row.created_at,
});
exports.kybRepository = {
    async createCase(input) {
        const result = await pool_1.pool.query(`
      insert into kyb_cases (
        rfc,
        legal_name,
        address,
        legal_representative_name,
        shareholders,
        beneficial_owner
      )
      values ($1, $2, $3, $4, $5, $6)
      returning *
      `, [
            input.rfc,
            input.legalName,
            input.address,
            input.legalRepresentativeName,
            JSON.stringify(input.shareholders || []),
            input.beneficialOwner || null,
        ]);
        return mapKybCaseRow(result.rows[0]);
    },
    async findAllCases() {
        const result = await pool_1.pool.query(`
      select
        kc.*,
        coalesce(latest_score.can_approve, false) as can_approve
      from kyb_cases kc
      left join lateral (
        select rs.can_approve
        from risk_scores rs
        where rs.case_id = kc.id
        order by rs.created_at desc
        limit 1
      ) latest_score on true
      order by kc.created_at desc
      `);
        return result.rows.map(mapKybCaseRow);
    },
    async findCaseById(id) {
        const caseResult = await pool_1.pool.query(`
      select
        kc.*,
        coalesce(latest_score.can_approve, false) as can_approve
      from kyb_cases kc
      left join lateral (
        select rs.can_approve
        from risk_scores rs
        where rs.case_id = kc.id
        order by rs.created_at desc
        limit 1
      ) latest_score on true
      where kc.id = $1
      `, [id]);
        if (caseResult.rowCount === 0) {
            return null;
        }
        const kybCase = mapKybCaseRow(caseResult.rows[0]);
        const documentsResult = await pool_1.pool.query(`
      select *
      from kyb_documents
      where case_id = $1
      order by created_at desc
      `, [id]);
        kybCase.documents = documentsResult.rows.map(mapDocumentRow);
        const satChecksResult = await pool_1.pool.query(`
      select *
      from sat_list_checks
      where case_id = $1
      order by checked_at desc
      `, [id]);
        kybCase.satListChecks = satChecksResult.rows.map((row) => ({
            id: row.id,
            caseId: row.case_id,
            rfcSearched: row.rfc_searched,
            source: row.source,
            result: row.result,
            referenceUrl: row.reference_url,
            rawMatch: row.raw_match || {},
            checkedAt: row.checked_at,
        }));
        const riskFactorsResult = await pool_1.pool.query(`
      select *
      from risk_factors
      where case_id = $1
      order by created_at desc
      `, [id]);
        kybCase.riskFactors = riskFactorsResult.rows.map((row) => ({
            code: row.code,
            label: row.label,
            description: row.description,
            points: row.points,
            severity: row.severity,
            evidence: row.evidence || {},
        }));
        return kybCase;
    },
    async addDocumentMetadata(input) {
        const result = await pool_1.pool.query(`
      insert into kyb_documents (
        case_id,
        type,
        status,
        issue_date,
        expiration_date,
        extracted_rfc,
        extracted_legal_name,
        extracted_address,
        extracted_representative,
        file_url
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      returning *
      `, [
            input.caseId,
            input.type,
            input.status,
            input.issueDate || null,
            input.expirationDate || null,
            input.extractedRfc || null,
            input.extractedLegalName || null,
            input.extractedAddress || null,
            input.extractedRepresentative || null,
            input.fileUrl || null,
        ]);
        await pool_1.pool.query(`
      update kyb_cases
      set updated_at = now()
      where id = $1
      `, [input.caseId]);
        return mapDocumentRow(result.rows[0]);
    },
    async createAuditLog(input) {
        await pool_1.pool.query(`
      insert into audit_logs (
        case_id,
        action,
        entity_type,
        entity_id,
        message,
        metadata
      )
      values ($1, $2, $3, $4, $5, $6)
      `, [
            input.caseId || null,
            input.action,
            input.entityType,
            input.entityId || null,
            input.message,
            JSON.stringify(input.metadata || {}),
        ]);
    },
    async saveRiskResult(input) {
        const client = await pool_1.pool.connect();
        try {
            await client.query("begin");
            const riskScoreResult = await client.query(`
        insert into risk_scores (
          case_id,
          score,
          decision,
          can_approve,
          explanation
        )
        values ($1, $2, $3, $4, $5)
        returning *
        `, [
                input.caseId,
                input.score,
                input.decision,
                input.canApprove,
                input.explanation,
            ]);
            const riskScoreId = riskScoreResult.rows[0].id;
            await client.query(`
        delete from risk_factors
        where case_id = $1
        `, [input.caseId]);
            for (const factor of input.riskFactors) {
                await client.query(`
          insert into risk_factors (
            case_id,
            risk_score_id,
            code,
            label,
            description,
            points,
            severity,
            evidence
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
                    input.caseId,
                    riskScoreId,
                    factor.code,
                    factor.label,
                    factor.description,
                    factor.points,
                    factor.severity,
                    JSON.stringify(factor.evidence || {}),
                ]);
            }
            await client.query(`
        update kyb_cases
        set
          score = $1,
          decision = $2,
          status = $3,
          updated_at = now()
        where id = $4
        `, [
                input.score,
                input.decision,
                input.decision === "safe" ? "draft" : input.decision,
                input.caseId,
            ]);
            await client.query("commit");
            return {
                riskScoreId,
            };
        }
        catch (error) {
            await client.query("rollback");
            throw error;
        }
        finally {
            client.release();
        }
    },
};

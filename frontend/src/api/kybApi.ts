import axios from "axios";
import type { KybCase, KybDocumentType, RiskResult, AuditLog, SatImportLog } from "../types/kyb";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

export type CreateKybCasePayload = {
  rfc: string;
  legalName: string;
  address: string;
  legalRepresentativeName: string;
  shareholders?: string[];
  beneficialOwner?: string;
};

export type AddDocumentMetadataPayload = {
  type: KybDocumentType;
  issueDate?: string;
  expirationDate?: string;
  extractedRfc?: string;
  extractedLegalName?: string;
  extractedAddress?: string;
  extractedRepresentative?: string;
  fileUrl?: string;
};

export const kybApi = {
  async getCases() {
    const response = await api.get<{ ok: boolean; data: KybCase[] }>(
      "/api/kyb-cases"
    );

    return response.data.data;
  },

  async getCaseById(id: string) {
    const response = await api.get<{ ok: boolean; data: KybCase }>(
      `/api/kyb-cases/${id}`
    );

    return response.data.data;
  },

  async createCase(payload: CreateKybCasePayload) {
    const response = await api.post<{ ok: boolean; data: KybCase }>(
      "/api/kyb-cases",
      payload
    );

    return response.data.data;
  },

  async addDocumentMetadata(caseId: string, payload: AddDocumentMetadataPayload) {
    const response = await api.post(
      `/api/kyb-cases/${caseId}/documents/metadata`,
      payload
    );

    return response.data.data;
  },

  async runSatListCheck(caseId: string) {
    const response = await api.post(`/api/kyb-cases/${caseId}/sat-list-check`);

    return response.data.data;
  },

  async runRiskCheck(caseId: string) {
    const response = await api.post<{ ok: boolean; data: RiskResult }>(
      `/api/kyb-cases/${caseId}/run-check`
    );

    return response.data.data;
  },

  async approveCase(caseId: string) {
    const response = await api.post(`/api/kyb-cases/${caseId}/approve`);

    return response.data.data;
  },

  async getAuditLogs(caseId: string) {
    const response = await api.get<{ ok: boolean; data: AuditLog[] }>(
      `/api/kyb-cases/${caseId}/audit-logs`
    );

    return response.data.data;
  },

  async getSatImportLogs() {
    const response = await api.get<{ ok: boolean; data: SatImportLog[] }>(
      "/api/kyb-cases/sat/import-logs"
    );

    return response.data.data;
  },

  async runSatImport() {
    const response = await api.post("/api/kyb-cases/sat/import");

    return response.data.data;
  },

  getReportJsonUrl(caseId: string) {
    return `${api.defaults.baseURL}/api/kyb-cases/${caseId}/report.json`;
  },

  getReportPdfUrl(caseId: string) {
    return `${api.defaults.baseURL}/api/kyb-cases/${caseId}/report.pdf`;
  },

};

export const wakeUpBackend = async () => {
  try {
    await api.get("/api/health");
  } catch (error) {
    console.warn("Backend wake up failed:", error);
  }
};
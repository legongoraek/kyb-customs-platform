import { Router } from "express";
import {
  addKybDocumentMetadata,
  approveKybCase,
  createKybCase,
  getKybCaseById,
  getKybCases,
  runKybCheck,
  runSatListCheck,
  getSatSources,
  importSatSources,
  getSatImportLogs,
  getKybCaseAuditLogs,
  getKybCaseReportJson,
  getKybCaseReportPdf,
} from "./kyb.controller";

export const kybRoutes = Router();

kybRoutes.get("/", getKybCases);
kybRoutes.post("/", createKybCase);

kybRoutes.get("/sat/sources", getSatSources);
kybRoutes.post("/sat/import", importSatSources);
kybRoutes.get("/sat/import-logs", getSatImportLogs);

kybRoutes.get("/:id", getKybCaseById);
kybRoutes.get("/:id/audit-logs", getKybCaseAuditLogs);
kybRoutes.get("/:id/report.json", getKybCaseReportJson);
kybRoutes.get("/:id/report.pdf", getKybCaseReportPdf);

kybRoutes.post("/:id/documents/metadata", addKybDocumentMetadata);
kybRoutes.post("/:id/sat-list-check", runSatListCheck);
kybRoutes.post("/:id/run-check", runKybCheck);
kybRoutes.post("/:id/approve", approveKybCase);
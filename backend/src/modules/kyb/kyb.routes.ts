import { Router } from "express";
import {
  addKybDocumentMetadata,
  approveKybCase,
  createKybCase,
  getKybCaseById,
  getKybCases,
  runKybCheck,
  runSatListCheck,
} from "./kyb.controller";

export const kybRoutes = Router();

kybRoutes.get("/", getKybCases);
kybRoutes.post("/", createKybCase);
kybRoutes.get("/:id", getKybCaseById);

kybRoutes.post("/:id/documents/metadata", addKybDocumentMetadata);
kybRoutes.post("/:id/sat-list-check", runSatListCheck);
kybRoutes.post("/:id/run-check", runKybCheck);
kybRoutes.post("/:id/approve", approveKybCase);
import { z } from "zod";
import { KYB_DOCUMENT_TYPES } from "./kyb.constants";

export const createKybCaseSchema = z.object({
  rfc: z
    .string()
    .min(12, "RFC inválido")
    .max(13, "RFC inválido")
    .transform((value) => value.trim().toUpperCase()),

  legalName: z
    .string()
    .min(3, "La razón social es obligatoria")
    .transform((value) => value.trim().toUpperCase()),

  address: z
    .string()
    .min(5, "El domicilio es obligatorio")
    .transform((value) => value.trim()),

  legalRepresentativeName: z
    .string()
    .min(3, "El representante legal es obligatorio")
    .transform((value) => value.trim().toUpperCase()),

  shareholders: z.array(z.string()).optional(),
  beneficialOwner: z.string().optional(),
});

export const addKybDocumentMetadataSchema = z.object({
  type: z.enum([
    KYB_DOCUMENT_TYPES.ACTA_CONSTITUTIVA,
    KYB_DOCUMENT_TYPES.IDENTIFICACION_REPRESENTANTE,
    KYB_DOCUMENT_TYPES.PODER_REPRESENTANTE,
    KYB_DOCUMENT_TYPES.COMPROBANTE_DOMICILIO,
    KYB_DOCUMENT_TYPES.RFC,
    KYB_DOCUMENT_TYPES.CONSTANCIA_SITUACION_FISCAL,
    KYB_DOCUMENT_TYPES.MANIFESTACION_BAJO_PROTESTA,
    KYB_DOCUMENT_TYPES.SOCIOS_ACCIONISTAS,
    KYB_DOCUMENT_TYPES.BENEFICIARIO_CONTROLADOR,
  ]),

  issueDate: z.string().optional(),
  expirationDate: z.string().optional(),

  extractedRfc: z.string().optional(),
  extractedLegalName: z.string().optional(),
  extractedAddress: z.string().optional(),
  extractedRepresentative: z.string().optional(),
  fileUrl: z.string().optional(),
});

export type CreateKybCaseInput = z.infer<typeof createKybCaseSchema>;
export type AddKybDocumentMetadataInput = z.infer<
  typeof addKybDocumentMetadataSchema
>;